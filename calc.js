(function () {
  const questions = [
    {
      name: "sleep",
      question: "今日の睡眠時間は？",
      options: {
        1: "寝ていない",
        2: "3時間以下",
        3: "6時間以下",
        4: "6~8時間",
        5: "8時間以上"
      }
    },
    {
      name: "exercise",
      question: "今日の運動時間は？",
      options: {
        1: "家から出ていない",
        2: "通学だけ",
        3: "軽く走った",
        4: "しっかりした",
        5: "かなりした"
      }
    },
    {
      name: "meal",
      question: "今日の食事はどうでしたか？",
      options: {
        1: "ほとんど食べていない",
        2: "1食だけ",
        3: "2食",
        4: "3食だがバランス悪い",
        5: "3食バランス良く"
      }
    },
    {
      name: "condition",
      question: "今日の体調は？",
      options: {
        1: "とても悪い",
        2: "悪い",
        3: "普通",
        4: "良い",
        5: "とても良い"
      }
    },
    {
      name: "mood",
      question: "今日の気分はどうでしたか？",
      options: {
        1: "とても悪い",
        2: "悪い",
        3: "普通",
        4: "良い",
        5: "とても良い"
      }
    },
    {
      name: "routine",
      question: "今日は規則正しい生活ができましたか？",
      options: {
        1: "全くできていない",
        2: "あまりできていない",
        3: "普通",
        4: "だいたいできた",
        5: "しっかりできた"
      }
    },
    {
      name: "focus",
      question: "今日は集中して作業できましたか？",
      options: {
        1: "全くできていない",
        2: "あまりできていない",
        3: "普通",
        4: "だいたいできた",
        5: "しっかりできた"
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
        showFormError("AI連携を使うには、npm startで起動して http://localhost:3000/front.html から開いてください。");
        return;
      }

      const formData = new FormData(form);
      const answers = getAnswers(formData);

      try {
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = "AIが確認中...";
        }
        showFormError("AIが健康チェック結果を作成しています。");

        const response = await fetch("/api/health-check", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ answers })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "AIから結果を取得できませんでした。");
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
          submitButton.textContent = "健康状態を確認する";
        }
      }
    });
  }

  if (resultMessage && resultScore && resultAdvice) {
    const savedResult = sessionStorage.getItem(storageKey);

    if (!savedResult) {
      resultMessage.textContent = "まだ健康チェックが完了していません";
      resultScore.textContent = "先に質問に答えてください。";
      resultAdvice.innerHTML = "<a href=\"check.html\">チェック画面へ進む</a>";
      return;
    }

    const result = JSON.parse(savedResult);
    const totalScore = result.answers.reduce(function (total, answer) {
      return total + answer.score;
    }, 0);
    const maxScore = result.answers.length * 5;

    resultMessage.textContent = "AIによる今日の健康チェック結果";
    resultScore.textContent = `回答スコア：${totalScore} / ${maxScore}`;
    resultAdvice.textContent = result.result;
  }
}());
