(function () {
  const questionNames = [
    "sleep",
    "exercise",
    "meal",
    "condition",
    "mood",
    "routine",
    "focus"
  ];

  const storageKey = "healthCheckResult";
  const form = document.getElementById("healthForm");
  const resultMessage = document.getElementById("resultMessage");
  const resultScore = document.getElementById("resultScore");
  const resultAdvice = document.getElementById("resultAdvice");

  function makeResult(score, maxScore) {
    const percent = Math.round((score / maxScore) * 100);

    if (percent >= 80) {
      return {
        score,
        maxScore,
        percent,
        message: "とても良い健康状態です",
        advice: "今のリズムを保ちながら、無理をしすぎないようにしましょう。"
      };
    }

    if (percent >= 60) {
      return {
        score,
        maxScore,
        percent,
        message: "おおむね良い健康状態です",
        advice: "睡眠・食事・運動のうち、少し低かった項目を意識するとさらに良くなります。"
      };
    }

    if (percent >= 40) {
      return {
        score,
        maxScore,
        percent,
        message: "少し注意が必要です",
        advice: "今日は休息を取り、生活リズムを整えることを優先しましょう。"
      };
    }

    return {
      score,
      maxScore,
      percent,
      message: "体調管理を優先しましょう",
      advice: "無理をせず、睡眠や食事をしっかり取りましょう。つらい時は周りの人に相談してください。"
    };
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      const formData = new FormData(form);
      const score = questionNames.reduce(function (total, name) {
        return total + Number(formData.get(name));
      }, 0);
      const result = makeResult(score, questionNames.length * 5);

      sessionStorage.setItem(storageKey, JSON.stringify(result));
      location.href = "result.html";
    });
  }

  if (resultMessage && resultScore) {
    const savedResult = sessionStorage.getItem(storageKey);

    if (!savedResult) {
      resultMessage.textContent = "まだ健康チェックが完了していません";
      resultScore.textContent = "先に質問に答えてください。";
      if (resultAdvice) {
        resultAdvice.innerHTML = "<a href=\"check.html\">チェック画面へ進む</a>";
      }
      return;
    }

    const result = JSON.parse(savedResult);
    resultMessage.textContent = result.message;
    resultScore.textContent = `スコア：${result.score} / ${result.maxScore}（${result.percent}%）`;

    if (resultAdvice) {
      resultAdvice.textContent = result.advice;
    }
  }
}());
