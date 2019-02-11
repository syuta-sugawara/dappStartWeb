
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

ScatterJS.plugins( new ScatterEOS() );

function connectScatter(){
  event.preventDefault()
  ScatterJS.plugins( new ScatterEOS() );

  const network = ScatterJS.Network.fromJson({
    blockchain:'eos',
    chainId:'5fff1dae8dc8e2fc4d5b23b2c7665c97f9e9d8edf2b6485a86ba311c25639191',
    host:'api.kylin.alohaeos.com',
    port:443,
    protocol:'https'
  });

  ScatterJS.connect('dappStart', {network}).then(connected => {
    console.log(connected)
    if(!connected) return false;
    const scatter = ScatterJS.scatter;
    console.log(scatter)
    ScatterJS.login().then(d =>{
      console.log(d)
    });
  });
}

const network = ScatterJS.Network.fromJson({
  blockchain:'eos',
  protocol:'https',
  host:'api.kylin.alohaeos.com',
  port:"443",
  chainId:"5fff1dae8dc8e2fc4d5b23b2c7665c97f9e9d8edf2b6485a86ba311c25639191",
});

const rpc = new eosjs_jsonrpc.default(network.fullhost());
const eos = ScatterJS.scatter.eos(network, eosjs_api.default, { rpc, beta3:true })
console.log(eos)

