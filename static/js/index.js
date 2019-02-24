import ScatterJS from 'scatterjs-core';
import ScatterEOS from 'scatterjs-plugin-eosjs2';
import {JsonRpc, Api, Serialize} from 'eosjs';
import axios from 'axios';

ScatterJS.plugins(new ScatterEOS());

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
});

const eos = ScatterJS.scatter.eos(network, Api, { rpc, beta3:true });
window.scatterConnected = false;

const scatterNameElement = document.getElementById('scatterName');
const logoutScatterButton = document.getElementById('logoutScatterButton');

const connectScatterButton = document.getElementById('connectScatterButton');
function loadAccount() {
  ScatterJS.scatter.connect('dappStart', {network}).then(connected => {
    if ( !connected ) {
      console.log("not connect");
    }
    if(ScatterJS.scatter.identity != null) {
      window.scatterAccount = ScatterJS.scatter.identity.accounts.find(x => x.blockchain === 'eos');
      window.scatterConnected = true;
      scatterNameElement.innerText = window.scatterAccount.name;
      afterLogin();
    } else {
      connectScatterButton.disabled = false;
    }
  });
}
loadAccount();

const createAccountButton = document.getElementById('createAccountButton');
createAccountButton && createAccountButton.addEventListener('click', () => createAccount());
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

const getFaucetButton = document.getElementById('getFaucetButton');
getFaucetButton && getFaucetButton.addEventListener('click', () => getFaucet());
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

connectScatterButton && connectScatterButton.addEventListener('click', () => connectScatter());
function connectScatter(){
  ScatterJS.connect('dappStart', {network}).then(connected => {
    console.log(connected)
    if(!connected) return false;
    ScatterJS.logout().then(r =>{
      ScatterJS.login().then(d =>{
        console.log(d);
        alert(`Logged in by "${d.accounts[0].name}"`);
        window.scatterAccount = d.accounts[0];
        scatterNameElement.innerText = window.scatterAccount.name;
        afterLogin();
      });
    });
  });
}

const buyRamButton = document.getElementById('buyRamButton');
buyRamButton && buyRamButton.addEventListener('click', () => buyRam());
async function buyRam(){
  const payerInput = document.getElementById('payerInput');
  const receiverInput = document.getElementById('receiverInput');
  const amountInput = document.getElementById('amountInput');
  const result = await eos.transact({
    actions: [{
      account: 'eosio',
      name: 'buyram',
      authorization: [{
        actor: window.scatterAccount.name,
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
  alert(`Success Buy Ram! from "${window.scatterAccount.name}"`);
}

const deployContractButton = document.getElementById('deployContractButton');
deployContractButton && deployContractButton.addEventListener('click', () => deployContract());
async function deployContract(){
  const result = await eos.transact({
    actions: [{
      account: 'eosio',
      name: 'setcode',
      authorization: [{
        actor: window.scatterAccount.name,
        permission: 'active',
      }],
      data: {
        account: window.scatterAccount.name,
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
            actor: window.scatterAccount.name,
            permission: 'active',
          },
        ],
        data: {
          account: window.scatterAccount.name,
          abi: window.abi,
        },
      }]
  }, {
    blocksBehind: 3,
    expireSeconds: 30,
  });
  console.log(result);
}

const setWasmInput = document.getElementById('setWasmInput');
setWasmInput && setWasmInput.addEventListener('change', (e) => setWasm(e));
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

const setAbiInput = document.getElementById('setAbiInput');
setAbiInput && setAbiInput.addEventListener('change', (e) => setAbi(e));
function setAbi(e) {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.addEventListener('load', (e) =>{
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

const createProjectModalOpenButton = document.getElementById('createProjectModalOpenButton');
createProjectModalOpenButton && createProjectModalOpenButton.addEventListener('click', () => {
  document.getElementById('createProjectModal').style.display = 'flex';
});

const modalClose = document.getElementById('modalClose');
modalClose && modalClose.addEventListener('click', () => {
  document.getElementById('createProjectModal').style.display = 'none';
});

const modalBackground = document.getElementById('modalBackground');
modalBackground && modalBackground.addEventListener('click', () => {
  document.getElementById('createProjectModal').style.display = 'none';
});

const getYourContractButton = document.getElementById('getYourContractButton');

getYourContractButton && getYourContractButton.addEventListener('click', async () => {
  const contractDataContainer = document.getElementById('contractDataContainer');
  const contractNameInput = document.getElementById('contractNameInput');
  window.contractName = contractNameInput.value;
  const contract = await api.getContract(window.scatterAccount.name);
  window.contractFields = contract.actions.get(window.contractName).fields;

  const input = document.createElement("input");
  input.setAttribute("type","text");
  input.classList.add('input');
  input.classList.add('contract-value-input');

  for(let i=0; i < window.contractFields.length; i++) {
    input.setAttribute('data-name', contractFields[i].name);
    input.setAttribute("placeholder", contractFields[i].name);
    contractDataContainer.appendChild(input);
  }

  if(window.contractFields.length !== 0) {
    getYourContractButton.disabled = true;
    contractNameInput.disabled = true;
    document.getElementsByClassName('my-contract-button')[0].style.display = 'block';
  }
});

const tryYourContractButton = document.getElementById('tryYourContractButton');

tryYourContractButton && tryYourContractButton.addEventListener('click', async () => {
  const inputs = document.getElementsByClassName('contract-value-input');
  const data = {};

  for(let i=0; i < inputs.length; i++) {
    data[window.contractFields[i].name] = inputs[i].value;
  }

  await eos.transact({
    actions: [{
      account: window.scatterAccount.name,
      name: window.contractName,
      authorization: [{
        actor: window.scatterAccount.name,
        permission: 'active',
        broadcast: true,
        sign: true
      }],
      data: data
    }],
  }, {
    blocksBehind: 3,
    expireSeconds: 30,
  }).catch(e => {
    const messageDom= document.getElementById("message");
    messageDom.classList.add("has-text-danger");
    messageDom.classList.remove("hidden");
    messageDom.classList.add("visible");
    messageDom.innerText = e.message;
  });
});

function afterLogin() {
  document.getElementById("accountForFaucet").value = window.scatterAccount.name;
  document.getElementById('payerInput').value = window.scatterAccount.name;
  document.getElementById('receiverInput').value = window.scatterAccount.name;
  logoutScatterButton.disabled = false;
  getYourContractButton.disabled = false;
  deployContractButton.disabled = false;
  buyRamButton.disabled = false;
  connectScatterButton.disabled = true;
}

logoutScatterButton && logoutScatterButton.addEventListener('click', () => {
  if(ScatterJS.scatter.identity != null) {
    logoutScatterButton.disabled = true;
    ScatterJS.scatter.forgetIdentity();
    connectScatterButton.disabled = false;
    window.scatterConnected = false;
    document.getElementById("accountForFaucet").value = '';
    document.getElementById('payerInput').value = '';
    document.getElementById('receiverInput').value = '';
    scatterNameElement.innerText = 'Not connected';
    getYourContractButton.disabled = true;
    deployContractButton.disabled = true;
    buyRamButton.disabled = true;
  }
});
