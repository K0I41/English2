function check_result() {
  // alert("JS動いた！");
  let selected = document.querySelector('input[name = "sleep"]:checked')

    if(selected) {
        let value = selected.value
        document.getElementById("result").textContent = "睡眠の点数は " + value + " です";
    } else {

        document.getElementById("result").textContent = "選択してください";
    }
}
