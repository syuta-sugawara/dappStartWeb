
function createAccount(){
    event.preventDefault()
    var account;
    account= document.getElementById("account_name").value;
    var site='http://faucet.cryptokylin.io/create_account?'+account;
    alert(site)
    location.href = 'http://faucet.cryptokylin.io/create_account?'+account;

}

function getFaucet(){
    event.preventDefault()
    var accountForFaucet;
    accountForFaucet= document.getElementById("accountForFaucet").value;
    var siteForFaucet='http://faucet.cryptokylin.io/get_token?'+accountForFaucet;
    console.log(siteForFaucet)
    location.href = siteForFaucet;
}