document.addEventListener("DOMContentLoaded", () => {

  lucide.createIcons();


  const openModalBtn = document.getElementById("open-ai-modal-btn");
  const closeModalBtn = document.getElementById("close-ai-modal-btn");
  const modal = document.getElementById("ai-modal");
  const modalContent = document.getElementById("ai-modal-content");


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
        generatedContentContainer.innerHTML = "";
        problemInput.value = "";
      }, 300);
    };

    openModalBtn.addEventListener("click", openModal);
    closeModalBtn.addEventListener("click", closeModal);
  
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });


    generateIdeaBtn.addEventListener("click", async () => {
      const userInput = problemInput.value.trim();
      if (!userInput) {
    
        const tempAlert = document.createElement("div");
        tempAlert.textContent = "Please describe your problem or idea first.";
        tempAlert.style.cssText =
          "position:fixed;top:20px;left:50%;transform:translateX(-50%);background:red;color:white;padding:10px 20px;border-radius:8px;z-index:1000;";
        document.body.appendChild(tempAlert);
        setTimeout(() => tempAlert.remove(), 3000);
        return;
      }

      formContainer.classList.add("hidden");
      resultsContainer.classList.remove("hidden");
      loadingIndicator.classList.remove("hidden");
      errorIndicator.classList.add("hidden");
      generatedContentContainer.innerHTML = "";

      const prompt = `You are an expert AI Solutions Developer. A potential client has described a business problem. Based on their problem, generate a creative and practical tech project idea. The project should be something a skilled developer could build. Provide a project name, a short description, a list of 3-5 key features, and a recommended tech stack. The problem is: "${userInput}"`;

      const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];

      const payload = {
        contents: chatHistory,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              projectName: { type: "STRING" },
              description: { type: "STRING" },
              keyFeatures: { type: "ARRAY", items: { type: "STRING" } },
              techStack: { type: "ARRAY", items: { type: "STRING" } },
            },
            required: [
              "projectName",
              "description",
              "keyFeatures",
              "techStack",
            ],
          },
        },
      };

      const apiKey = ""; 
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const result = await response.json();

        if (result.candidates?.[0]?.content?.parts?.[0]) {
          const jsonText = result.candidates[0].content.parts[0].text;
          const idea = JSON.parse(jsonText);
          renderGeneratedIdea(idea);
        } else {
          throw new Error("Invalid response structure from API.");
        }
      } catch (err) {
        console.error("Error calling Gemini API:", err);
        errorIndicator.classList.remove("hidden");
      } finally {
        loadingIndicator.classList.add("hidden");
      }
    });

   
    function renderGeneratedIdea(idea) {
      const featuresHtml = idea.keyFeatures
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

      
      document
        .getElementById("start-over-btn")
        .addEventListener("click", () => {
          formContainer.classList.remove("hidden");
          resultsContainer.classList.add("hidden");
          generatedContentContainer.innerHTML = "";
        });
    }
  }
});
