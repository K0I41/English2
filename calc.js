(function () {
  const questions = [
    {
      name: "sleep",
      question: "How long did you sleep today?",
      options: {
        1: "No sleep",
        2: "3 hours or less",
        3: "6 hours or less",
        4: "6 to 8 hours",
        5: "8 hours or more"
      }
    },
    {
      name: "exercise",
      question: "How much did you exercise today?",
      options: {
        1: "I did not go outside",
        2: "Only commuting",
        3: "Light exercise",
        4: "A solid workout",
        5: "A lot of exercise"
      }
    },
    {
      name: "meal",
      question: "How were your meals today?",
      options: {
        1: "I barely ate",
        2: "Only one meal",
        3: "Two meals",
        4: "Three meals, but not balanced",
        5: "Three balanced meals"
      }
    },
    {
      name: "condition",
      question: "How was your physical condition today?",
      options: {
        1: "Very poor",
        2: "Poor",
        3: "Average",
        4: "Good",
        5: "Very good"
      }
    },
    {
      name: "mood",
      question: "How was your mood today?",
      options: {
        1: "Very poor",
        2: "Poor",
        3: "Average",
        4: "Good",
        5: "Very good"
      }
    },
    {
      name: "routine",
      question: "Did you keep a regular daily routine today?",
      options: {
        1: "Not at all",
        2: "Not very well",
        3: "Average",
        4: "Mostly yes",
        5: "Yes, very well"
      }
    },
    {
      name: "focus",
      question: "Were you able to focus on your work today?",
      options: {
        1: "Not at all",
        2: "Not very well",
        3: "Average",
        4: "Mostly yes",
        5: "Yes, very well"
      }
    }
  ];

  const storageKey = "healthCheckResult";
  const form = document.getElementById("healthForm");
  const submitButton = document.getElementById("submitButton");
  const resultStatus = document.getElementById("result");
  const resultMessage = document.getElementById("resultMessage");
  const resultScore = document.getElementById("resultScore");
  const resultAdvice = document.getElementById("resultAdvice");

  function getAnswers(formData) {
    return questions.map(function (item) {
      const score = formData.get(item.name);

      return {
        name: item.name,
        question: item.question,
        answer: item.options[score],
        score: Number(score)
      };
    });
  }

  function showFormError(message) {
    if (resultStatus) {
      resultStatus.textContent = message;
    }
  }

  if (form) {
    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      if (location.protocol === "file:") {
        showFormError("To use AI integration, start the server with npm start and open http://localhost:3000/front.html.");
        return;
      }

      const formData = new FormData(form);
      const answers = getAnswers(formData);

      try {
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = "Checking with AI...";
        }
        showFormError("AI is creating your health check result.");

        const response = await fetch("/api/health-check", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ answers })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Could not get a result from AI.");
        }

        sessionStorage.setItem(storageKey, JSON.stringify({
          answers,
          result: data.result
        }));
        location.href = "result.html";
      } catch (error) {
        showFormError(error.message);

        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = "Check Health Status";
        }
      }
    });
  }

  if (resultMessage && resultScore && resultAdvice) {
    const savedResult = sessionStorage.getItem(storageKey);

    if (!savedResult) {
      resultMessage.textContent = "The health check has not been completed yet";
      resultScore.textContent = "Please answer the questions first.";
      resultAdvice.innerHTML = "<a href=\"check.html\">Go to the check page</a>";
      return;
    }

    const result = JSON.parse(savedResult);
    const totalScore = result.answers.reduce(function (total, answer) {
      return total + answer.score;
    }, 0);
    const maxScore = result.answers.length * 5;

    resultMessage.textContent = "AI Health Check Result";
    resultScore.textContent = `Answer score: ${totalScore} / ${maxScore}`;
    resultAdvice.textContent = result.result;
  }
}());
