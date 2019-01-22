
function createAccount(){
    var account;
    account= document.getElementById("account_name").value;
    var site='http://faucet.cryptokylin.io/create_account?'+account;
    console.log(site)
    location.href = site;
}

function getFaucet(){
    var accountForFaucet;
    accountForFaucet= document.getElementById("accountForFaucet").value;
    var siteForFaucet='http://faucet.cryptokylin.io/get_token?'+accountForFaucet;
    console.log(siteForFaucet)
    location.href = siteForFaucet;
}