import ScatterJS from 'scatterjs-core';
import ScatterEOS from 'scatterjs-plugin-eosjs2';
import {JsonRpc, Api, Serialize} from 'eosjs';
import axios from 'axios';

document.getElementById('createAccountButton').addEventListener('click', () => createAccount());
async function createAccount(){
  const account= document.getElementById("account_name").value;
  await axios.get('http://localhost:8000/projects/account/create?name=' + account)
    .then(function (response) {
      const messageDom= document.getElementById("message");
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

document.getElementById('getFaucetButton').addEventListener('click', () => getFaucet());
async function getFaucet(){
  const accountForFaucet= document.getElementById("accountForFaucet").value;
  await axios.get('http://localhost:8000/projects/account/faucet?name='+accountForFaucet)
    .then(function (response) {
      const messageDom = document.getElementById("message");
      if(response.data.result.error) {
        messageDom.classList.add("has-text-danger");
        messageDom.classList.remove("hidden");
        messageDom.classList.add("visible");
        messageDom.innerText = response.data.result.data;
      } else {
        alert('Succeeded get faucet.');
      }
    }).catch(function (error) {
      console.log(error);
    })
}


document.getElementById('connectScatterButton').addEventListener('click', () => connectScatter());
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
    ScatterJS.logout().then(r =>{
      ScatterJS.login().then(d =>{
        console.log(d);
        alert(`Logged in by "${d.accounts[0].name}"`);
        document.getElementById("accountForFaucet").value = d.accounts[0].name;
        document.getElementById('payerInput').value = d.accounts[0].name;
        document.getElementById('receiverInput').value = d.accounts[0].name;
        window.loginData = d;
      });
    });
  });
}

document.getElementById('buyRamButton').addEventListener('click', () => buyRam());
async function buyRam(){
  const network = ScatterJS.Network.fromJson({
    blockchain:'eos',
    protocol:'https',
    host:'api.kylin.alohaeos.com',
    port:"443",
    chainId:"5fff1dae8dc8e2fc4d5b23b2c7665c97f9e9d8edf2b6485a86ba311c25639191",
  });

  const payerInput = document.getElementById('payerInput');
  const receiverInput = document.getElementById('receiverInput');
  const amountInput = document.getElementById('amountInput');

  const rpc = new JsonRpc(network.fullhost());
  const eos = ScatterJS.scatter.eos(network, Api, { rpc, beta3:true });

  const result = await eos.transact({
    actions: [{
      account: 'eosio',
      name: 'buyram',
      authorization: [{
        actor: window.loginData.accounts[0].name,
        permission: 'active',
      }],
      data: {
        payer: payerInput.value,
        quant: `${parseFloat(amountInput.value).toFixed(4)} EOS`,
        receiver: receiverInput.value,
      },
    }]
  }, {
    blocksBehind: 3,
    expireSeconds: 30,
  });
  console.log(result);
  alert(`Success Buy Ram! from "${window.loginData.accounts[0].name}"`);
}


document.getElementById('deployContractButton').addEventListener('click', () => deployContract());
async function deployContract(){
  const network = ScatterJS.Network.fromJson({
    blockchain:'eos',
    protocol:'https',
    host:'api.kylin.alohaeos.com',
    port:"443",
    chainId:"5fff1dae8dc8e2fc4d5b23b2c7665c97f9e9d8edf2b6485a86ba311c25639191",
  });

  const rpc = new JsonRpc(network.fullhost());
  const eos = ScatterJS.scatter.eos(network, Api, { rpc, beta3:true });

  const result = await eos.transact({
    actions: [{
      account: 'eosio',
      name: 'setcode',
      authorization: [{
        actor: window.loginData.accounts[0].name,
        permission: 'active',
      }],
      data: {
        account: window.loginData.accounts[0].name,
        vmtype: 0,
        vmversion: 0,
        code: window.wasm,
      }
    },
      {
        account: 'eosio',
        name: 'setabi',
        authorization: [
          {
            actor: window.loginData.accounts[0].name,
            permission: 'active',
          },
        ],
        data: {
          account: window.loginData.accounts[0].name,
          abi: window.abi,
        },
      }]
  }, {
    blocksBehind: 3,
    expireSeconds: 30,
  });
  console.log(result);
}

document.getElementById('setWasmInput').addEventListener('change', (e) => setWasm(e));
function setWasm(e) {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.addEventListener('load', (e) =>{
    const buffer = e.target.result;
    window.wasm = Buffer.from(new Uint8Array(buffer)).toString('hex');
    console.log('set wasm !!');
  })
  reader.readAsArrayBuffer(file);
}

document.getElementById('setAbiInput').addEventListener('change', (e) => setAbi(e));
function setAbi(e) {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.addEventListener('load', (e) =>{

    const network = ScatterJS.Network.fromJson({
      blockchain:'eos',
      protocol:'https',
      host:'api.kylin.alohaeos.com',
      port:"443",
      chainId:"5fff1dae8dc8e2fc4d5b23b2c7665c97f9e9d8edf2b6485a86ba311c25639191",
    });

    const rpc = new JsonRpc(network.fullhost());

    const api = new Api({
      rpc,
      textDecoder: new TextDecoder(),
      textEncoder: new TextEncoder(),
    })

    const buffer = new Serialize.SerialBuffer({
      textEncoder: api.textEncoder,
      textDecoder: api.textDecoder,
    })

    let abi = JSON.parse(new TextDecoder("utf-8").decode(e.target.result));
    let abiDefinition = api.abiTypes.get('abi_def');
    abi = abiDefinition.fields.reduce(
      (acc, {name: fieldName}) => Object.assign(acc, {[fieldName]: acc[fieldName] || []}),
      abi,
    );

    abiDefinition.serialize(buffer, abi);
    window.abi = Buffer.from(buffer.asUint8Array()).toString('hex');
    console.log('set abi !!')
  })
  reader.readAsArrayBuffer(file);
}

document.getElementById('createProjectModalOpenButton').addEventListener('click', () => {
  document.getElementById('createProjectModal').style.display = 'flex';
});

document.getElementById('modalClose').addEventListener('click', () => {
  document.getElementById('createProjectModal').style.display = 'none';
});

document.getElementById('modalBackground').addEventListener('click', () => {
  document.getElementById('createProjectModal').style.display = 'none';
});
