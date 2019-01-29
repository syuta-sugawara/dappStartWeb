async function createAccount(){
  var account= document.getElementById("account_name").value;
  await axios.get('http://localhost:8000/projects/account/create?name=' + account)
    .then(function (response) {
      var messageDom= document.getElementById("message");
      if(response.data.result.error) {
        messageDom.classList.add("has-text-danger");
        messageDom.classList.remove("hidden");
        messageDom.classList.add("visible");
        messageDom.innerText = response.data.result.data;
      } else {
        messageDom.classList.remove("has-text-danger");
        messageDom.classList.remove("hidden");
        messageDom.classList.add("visible");
        messageDom.innerText = JSON.stringify(response.data.result.data, null , "\t");
      }
    }).catch(function (error) {
      console.log(error);
    })
}

function getFaucet(){
    event.preventDefault()
    var accountForFaucet;
    accountForFaucet= document.getElementById("accountForFaucet").value;
    var siteForFaucet='http://faucet.cryptokylin.io/get_token?'+accountForFaucet;
    console.log(siteForFaucet)
    location.href = siteForFaucet;
}