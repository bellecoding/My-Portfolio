document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();

  const openModalBtn = document.getElementById("open-ai-modal-btn");
  const openModalBtnMobile = document.getElementById(
    "open-ai-modal-btn-mobile"
  );
  const closeModalBtn = document.getElementById("close-ai-modal-btn");
  const modal = document.getElementById("ai-modal");
  const modalContent = document.getElementById("ai-modal-content");
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");

  if (openModalBtn && closeModalBtn && modal && modalContent) {
    const generateIdeaBtn = document.getElementById("generate-idea-btn");
    const problemInput = document.getElementById("problem-input");
    const formContainer = document.getElementById("ai-form-container");
    const resultsContainer = document.getElementById("ai-results-container");
    const loadingIndicator = document.getElementById("ai-loading");
    const errorIndicator = document.getElementById("ai-error");
    const generatedContentContainer = document.getElementById(
      "ai-generated-content"
    );

    const openModal = () => {
      modal.classList.remove("hidden");
      setTimeout(() => {
        modal.classList.remove("opacity-0");
        modalContent.classList.remove("opacity-0", "scale-95");
      }, 10);
    };

    const closeModal = () => {
      modalContent.classList.add("opacity-0", "scale-95");
      modal.classList.add("opacity-0");
      setTimeout(() => {
        modal.classList.add("hidden");
        formContainer.classList.remove("hidden");
        resultsContainer.classList.add("hidden");
        errorIndicator.classList.add("hidden");
        // Ensure form state is reset on close
        problemInput.value = "";
        loadingIndicator.classList.add("hidden");
      }, 300);
    };

    openModalBtn.addEventListener("click", openModal);
    openModalBtnMobile.addEventListener("click", openModal); // Add listener for mobile button
    closeModalBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    // Mobile menu toggle logic
    if (mobileMenuBtn && mobileMenu) {
      mobileMenuBtn.addEventListener("click", () => {
        mobileMenu.classList.toggle("hidden");
        const menuIcon = mobileMenuBtn.querySelector("i");
        if (mobileMenu.classList.contains("hidden")) {
          menuIcon.setAttribute("data-lucide", "menu");
        } else {
          menuIcon.setAttribute("data-lucide", "x");
        }
        lucide.createIcons();
      });
    }

    // Function to handle retrying or starting over
    const startOver = () => {
      formContainer.classList.remove("hidden");
      resultsContainer.classList.add("hidden");
      errorIndicator.classList.add("hidden");
      generatedContentContainer.innerHTML = "";
      problemInput.value = "";
      loadingIndicator.classList.add("hidden");
    };

    // Add event listeners for the 'start over' buttons
    document.addEventListener("click", (e) => {
      if (
        e.target.id === "start-over-btn" ||
        e.target.id === "start-over-btn-error"
      ) {
        startOver();
      }
    });

    generateIdeaBtn.addEventListener("click", async () => {
      const userQuery = problemInput.value.trim();
      if (!userQuery) {
        // NOTE: Cannot use alert(), using console error for demonstration
        console.error("Please describe your business problem or idea.");
        return;
      }

      // 1. Show loading, hide form/results
      formContainer.classList.add("hidden");
      resultsContainer.classList.remove("hidden");
      loadingIndicator.classList.remove("hidden");
      generatedContentContainer.innerHTML = "";
      errorIndicator.classList.add("hidden");

      const systemPrompt =
        "You are a Creative Technologist and AI Solutions Architect. Your role is to take a user's problem or idea and convert it into a structured, engaging, and professional project proposal. Respond ONLY with a single JSON array containing exactly one object with the following schema: { 'projectName': 'string', 'description': 'string', 'features': ['string'], 'techStack': ['string'] }. Do not include any conversational text outside of the JSON block.";
      const prompt = `Convert the following idea into a project proposal, focusing on an AI or Web solution: "${userQuery}"`;
      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

      const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              projectName: {
                type: "STRING",
                description: "A catchy, professional name for the project.",
              },
              description: {
                type: "STRING",
                description: "A one-sentence elevator pitch for the project.",
              },
              features: {
                type: "ARRAY",
                description: "A list of 4-6 bullet point features.",
                items: { type: "STRING" },
              },
              techStack: {
                type: "ARRAY",
                description: "A list of 3-5 key technologies.",
                items: { type: "STRING" },
              },
            },
            propertyOrdering: [
              "projectName",
              "description",
              "features",
              "techStack",
            ],
          },
        },
      };

      let idea = null;
      let retries = 0;
      const maxRetries = 3;
      let success = false;

      while (retries < maxRetries && !success) {
        try {
          const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;

          if (jsonText) {
            idea = JSON.parse(jsonText);
            success = true;
          } else {
            throw new Error("Empty response from API or invalid structure.");
          }
        } catch (error) {
          console.error(`Attempt ${retries + 1} failed:`, error);
          retries++;
          if (retries < maxRetries) {
            // Exponential backoff
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 * Math.pow(2, retries - 1))
            );
          }
        }
      }

      // 2. Hide loading, show content or error
      loadingIndicator.classList.add("hidden");

      if (idea && success) {
        const featuresHtml = idea.features
          .map(
            (feature) =>
              `<li class="flex items-start gap-3"><i data-lucide="check-circle-2" class="w-5 h-5 text-green-400 mt-1 flex-shrink-0"></i><span>${feature}</span></li>`
          )
          .join("");
        const techStackHtml = idea.techStack
          .map(
            (tech) =>
              `<span class="bg-gray-700 text-gray-200 text-xs font-medium px-2.5 py-1 rounded-full">${tech}</span>`
          )
          .join("");
        generatedContentContainer.innerHTML = `
                  <div class="space-y-6 text-left">
                      <div><h4 class="text-2xl font-bold gradient-text">${idea.projectName}</h4><p class="mt-2 text-gray-300">${idea.description}</p></div>
                      <div><h5 class="text-lg font-semibold mb-3">Key Features</h5><ul class="space-y-2 text-gray-300">${featuresHtml}</ul></div>
                      <div><h5 class="text-lg font-semibold mb-3">Suggested Tech Stack</h5><div class="flex flex-wrap gap-2">${techStackHtml}</div></div>
                      <button id="start-over-btn" class="mt-6 w-full bg-gray-700 text-white font-semibold py-2 px-4 rounded-full hover:bg-gray-600">Try Another Idea</button>
                  </div>
              `;
        lucide.createIcons();
      } else {
        errorIndicator.classList.remove("hidden");
      }
    });
  }

  /* --- CAROUSEL LOGIC --- */

  const galleries = document.querySelectorAll(".image-gallery");

  galleries.forEach((gallery) => {
    const images = gallery.querySelectorAll(".gallery-image");
    const prevButton = gallery.querySelector(".prev-btn");
    const nextButton = gallery.querySelector(".next-btn");
    const paginationContainer = gallery.querySelector(".gallery-pagination");
    let currentIndex = 0;

    // Function to render the current image and update controls
    const updateGallery = () => {
      images.forEach((img, index) => {
        img.style.opacity = index === currentIndex ? "1" : "0";
      });

      // Update pagination dots
      if (paginationContainer) {
        paginationContainer.innerHTML = "";
        images.forEach((_, index) => {
          const dot = document.createElement("div");
          dot.classList.add("dot");
          if (index === currentIndex) {
            dot.classList.add("active");
          }
          dot.addEventListener("click", () => {
            currentIndex = index;
            updateGallery();
          });
          paginationContainer.appendChild(dot);
        });
      }

      // Update button states
      if (prevButton) {
        prevButton.disabled = currentIndex === 0;
      }
      if (nextButton) {
        nextButton.disabled = currentIndex === images.length - 1;
      }
    };

    // Attach event listeners
    if (prevButton) {
      prevButton.addEventListener("click", () => {
        if (currentIndex > 0) {
          currentIndex--;
          updateGallery();
        }
      });
    }

    if (nextButton) {
      nextButton.addEventListener("click", () => {
        if (currentIndex < images.length - 1) {
          currentIndex++;
          updateGallery();
        }
      });
    }

    // Initialize the gallery
    updateGallery();

    // Hide controls if only one image is present
    if (images.length <= 1) {
      if (prevButton) prevButton.style.display = "none";
      if (nextButton) nextButton.style.display = "none";
      if (paginationContainer) paginationContainer.style.display = "none";
    }
  });

  /* --- LUCIDE ICONS Initialization --- */
  lucide.createIcons();
});
