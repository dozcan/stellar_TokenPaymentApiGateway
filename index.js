
var express = require('express');
var bodyParser =require('body-parser');
var request = require('request-promise');
var StellarSdk = require('stellar-sdk');
const helper = require('./helper.js');
const responseMaker =require('./responseMaker.js');
const requestTypeError = require('./enum.js');
const cors = require('cors');
var express = require('express');
const app = express();
var bodyParser = require('body-parser');

app.use(cors());
app.use(bodyParser.json({limit:1024*1024,type:'application/json'}));

balanceObject = {};
var publicKey;
var secret;
var Token;
var listenReceiverPayment;


const AccountCreate = async() => {

  try
  {
    StellarSdk.Network.useTestNetwork();
    const pair = StellarSdk.Keypair.random()
  
    await request.get({
      uri: 'https://horizon-testnet.stellar.org/friendbot',
      qs: { addr: pair.publicKey() },
      json: true
    }).then((response, second) => {
    }).then(() => {
      const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
      return server.loadAccount(pair.publicKey())
    }).then((account) => {
      account.balances.forEach(function(balance) {
        console.log('Type:', balance.asset_type, ', Balance:', balance.balance);
        balanceObject.asset_type = balance.asset_type;
        balanceObject.balance = balance.balance;
        balanceObject.publicKey = pair.publicKey();
        balanceObject.secret = pair.secret()
      });
  }).catch((err) => { 
    console.log(err) 
    throw err; 
  })

  }
  catch(err){
      throw err;
  }
}
app.get('/AccountCreate',function(req,res){
  
    var create = async() =>{
      try
      {
        await AccountCreate();
        key = ["publicKey","secret","balanceType","balance"];
        value = [balanceObject.publicKey, balanceObject.secret,balanceObject.asset_type,balanceObject.balance];
       
        rawResponseObject = responseMaker.createResponse(key,value);
        response = responseMaker.responseMaker(rawResponseObject);
        res.send(response);
      }
      catch(err)
      {
        errorCode = requestTypeError.transactional_error;
        errorMessage =  helper.error(errorCode,err);
        response = responseMaker.responseErrorMaker(errorCode,errorMessage);
        res.send(response);
      }
    }
    create();
});

app.post('/GetAsset',function(req,res){
  
  var create = async() =>{
    try
    {

      var publicKey = JSON.stringify(req.body.publicKey); 
      publicKey = helper.cleanWhiteCharacter(publicKey);

      var response;
      await request.get({
        uri: 'https://horizon-testnet.stellar.org/assets/',
        qs: { 
              asset_code:"MTP",
              asset_issuer: publicKey   
            },
        json: true
      }).then(function(data){
         console.log(data);
         response = data;
      }).catch(function(err){
        console.log(err);
        throw err;
      });

      var key = ["asset"];
      var value = [response];
     
      rawResponseObject = responseMaker.createResponse(key,value);
      response = responseMaker.responseMaker(rawResponseObject);
      res.send(response);
    }
    catch(err)
    {
      errorCode = requestTypeError.transactional_error;
      errorMessage =  helper.error(errorCode,err);
      response = responseMaker.responseErrorMaker(errorCode,errorMessage);
      res.send(response);
    }
  }
  create();
});

app.post('/GetBalance',function(req,res){
  
  var create = async() =>{
    try
    {
      var publicKey = JSON.stringify(req.body.publicKey); 
      publicKey = helper.cleanWhiteCharacter(publicKey);

      var response;
      await request.get({
        uri: 'https://horizon-testnet.stellar.org/accounts/'+publicKey+'/effects',
        json: true
      }).then(function(data){
         console.log(data);
         response = data;
      }).catch(function(err){
        console.log(err);
        throw err;
      });

      var key = ["balance"];
      var value = [response];
     
      rawResponseObject = responseMaker.createResponse(key,value);
      response = responseMaker.responseMaker(rawResponseObject);
      res.send(response);
    }
    catch(err)
    {
      errorCode = requestTypeError.transactional_error;
      errorMessage =  helper.error(errorCode,err);
      response = responseMaker.responseErrorMaker(errorCode,errorMessage);
      res.send(response);
    }
  }
  create();
});

app.post('/TokenCreate',function(req,res){

const set = async() =>{

  try{
   
    var issuerSecret = JSON.stringify(req.body.issuerSecret); 
    issuerSecret = helper.cleanWhiteCharacter(issuerSecret);
    var receiverSecret = JSON.stringify(req.body.receiverSecret);
    receiverSecret = helper.cleanWhiteCharacter(receiverSecret);

    var issuingKeys = StellarSdk.Keypair.fromSecret(issuerSecret);
    var receivingKeys = StellarSdk.Keypair.fromSecret(receiverSecret);
    var assetcode = "MTP";
    StellarSdk.Network.useTestNetwork();
    Token = new StellarSdk.Asset(assetcode,issuingKeys.publicKey());      
    const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
    var transaction;
    await server.loadAccount(receivingKeys.publicKey()).then(function(receiver){

        var transaction = new StellarSdk.TransactionBuilder(receiver)
        .addOperation(StellarSdk.Operation.changeTrust({
          asset: Token,
          limit: '1000000000'
        })).build();
        transaction.sign(receivingKeys);
        return server.submitTransaction(transaction);
    })
    
    .then(function() {
      return server.loadAccount(issuingKeys.publicKey())
    })
    
    .then(function(issuer) {
        transaction = new StellarSdk.TransactionBuilder(issuer)
        .addOperation(StellarSdk.Operation.payment({
          destination: receivingKeys.publicKey(),
          asset: Token,
          amount: '1000000000'
        })).build();
      transaction.sign(issuingKeys);
      return server.submitTransaction(transaction);
    })
    .catch(function(error) {
      throw  error;
    });

    key = ["transaction"];
    value = [transaction];
    rawResponseObject = responseMaker.createResponse(key,value);     
    response = responseMaker.responseMaker(rawResponseObject);
    res.send(response);    

  }
  
  catch(err){
    errorCode = requestTypeError.transactional_error;
    errorMessage = helper.error(errorCode,err);
    response = responseMaker.responseErrorMaker(errorCode,errorMessage);
    res.send(response);
  }
}

set();

});


app.post('/DepositToken',function(req,res){
   
 const set = async() => { 
  try{
    StellarSdk.Network.useTestNetwork();
    var tokenHolderSecret = JSON.stringify(req.body.tokenHolderSecret); 
    tokenHolderSecret = helper.cleanWhiteCharacter(tokenHolderSecret);
    var tokenHolderKeys = StellarSdk.Keypair.fromSecret(tokenHolderSecret);

    var tokenBuyerSecret = JSON.stringify(req.body.tokenBuyerSecret); 
    tokenBuyerSecret = helper.cleanWhiteCharacter(tokenBuyerSecret);
    var tokenBuyerKeys = StellarSdk.Keypair.fromSecret(tokenBuyerSecret);

    var tokenIssuerPublicKey = JSON.stringify(req.body.tokenIssuerPublicKey); 
    tokenIssuerPublicKey = helper.cleanWhiteCharacter(tokenIssuerPublicKey);

    Token = new StellarSdk.Asset("MTP",tokenIssuerPublicKey); 
    var amount = JSON.stringify(req.body.amount); 
    amount = helper.cleanWhiteCharacter(amount);
    var transaction;
    var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
    console.log(Token);
    var op ={
          selling: Token,
          buying: new StellarSdk.Asset.native(),
          amount: amount,
          price: 1,
          offerId:0 
        }

    var tokenHolderKeysPublicKey = tokenHolderKeys.publicKey();
    await server.loadAccount(tokenHolderKeysPublicKey).then(function(account)
    {
        var transaction = new StellarSdk.TransactionBuilder(account)
        .addOperation(StellarSdk.Operation.manageOffer(op)).build();

        transaction.sign(tokenHolderKeys);
        console.log(transaction.toEnvelope().toXDR('base64'));
        server.submitTransaction(transaction).then(function(transactionResult) 
        {
            console.log(JSON.stringify(transactionResult, null, 2));
            console.log('\nSuccess! View the transaction at: ');
            console.log(transactionResult._links.transaction.href);
        })
        .catch(function(err) {
            console.log('An error has occured:');
            console.log(err);   
            throw err;                
        });
      })
      .catch(function(err) {
        console.error(err);
        throw err;
      });

  
      
  /////////////////////////////////make payment//////////////////////////////////////////////

   await server.loadAccount(tokenBuyerKeys.publicKey()).then(function(receiver)
   {
        var transaction = new StellarSdk.TransactionBuilder(receiver)
        .addOperation(StellarSdk.Operation.changeTrust({
          asset: Token
        })).build();
      
        transaction.sign(tokenBuyerKeys);
        return server.submitTransaction(transaction);
    })
    
    .then(function() 
    {
        return server.loadAccount(tokenHolderKeys.publicKey())
    })
    
    .then(function(issuer) 
    {
        transaction = new StellarSdk.TransactionBuilder(issuer)
        .addOperation(StellarSdk.Operation.payment({
          destination: tokenBuyerKeys.publicKey(),
          asset: Token,
          amount: amount
        })).build();
      
         transaction.sign(tokenHolderKeys);
         return server.submitTransaction(transaction);
    })
    .catch(function(error) {
      console.error('Error!', error);
    });

    
    key = ["transaction"];
    value = [transaction];
    rawResponseObject = responseMaker.createResponse(key,value);     
    response = responseMaker.responseMaker(rawResponseObject);
    res.send(response);  
 

   }
   catch(error)
   {
        errorCode = requestTypeError.transactional_error;
        errorMessage =  helper.error(errorCode,error);
        response = responseMaker.responseErrorMaker(errorCode,errorMessage);
        res.send(response);
   }
}
set();
});


app.post('/MakePayment',function(req,res){
  
  var create = async() =>{
    try
    {
      let senderSecret = JSON.stringify(req.body.senderSecret);
      let receiverPublicKey = JSON.stringify(req.body.receiverPublicKey);
      let paymentAmount = JSON.stringify(req.body.paymentAmount);
      senderSecret = helper.cleanWhiteCharacter(senderSecret);
      receiverPublicKey = helper.cleanWhiteCharacter(receiverPublicKey);
      listenReceiverPayment = receiverPublicKey;
      paymentAmount = helper.cleanWhiteCharacter(paymentAmount);
      var tokenIssuerPublicKey = JSON.stringify(req.body.tokenIssuerPublicKey); 
      tokenIssuerPublicKey = helper.cleanWhiteCharacter(tokenIssuerPublicKey);
  
      Token = new StellarSdk.Asset("MTP",tokenIssuerPublicKey); 

      let result = await MakePayment(senderSecret,receiverPublicKey,paymentAmount,Token);
      key = ["result"];
      value = [result];
      rawResponseObject = responseMaker.createResponse(key,value);
      response = responseMaker.responseMaker(rawResponseObject);
      res.send(response);
    }
    catch(err)
    {
      errorCode = requestTypeError.transactional_error;
      errorMessage =  helper.error(errorCode,err);
      response = responseMaker.responseErrorMaker(errorCode,errorMessage);
      res.send(response);
    }
  }
  create();
});

const MakePayment = async(senderSecret,receiverPublicKey,paymentAmount,Token) =>{

 try{

  StellarSdk.Network.useTestNetwork();
  var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
  var sourceKeys = StellarSdk.Keypair.fromSecret(senderSecret);
  var destinationId = receiverPublicKey;
  var transaction;
  console.log("1");
  var _result = await server.loadAccount(destinationId)
    .catch(StellarSdk.NotFoundError, function (error) {
      throw new Error('The destination account does not exist!');
    })
    .then(function() {
      return server.loadAccount(sourceKeys.publicKey());
    })
    .then(function(sourceAccount) {
      console.log(sourceAccount);
      transaction = new StellarSdk.TransactionBuilder(sourceAccount)
        .addOperation(StellarSdk.Operation.payment({
          destination: destinationId,
          asset:Token,
          amount:paymentAmount
        }))
        .addMemo(StellarSdk.Memo.text('Test Transaction'))
        .build();
       
      transaction.sign(sourceKeys);
      console.log("4");
      return server.submitTransaction(transaction);
    })
    .then(function(result) {
      console.log('Success! Results:', result);
      return result;
    })
    .catch(function(error) {
      console.error('Something went wrong!', error);
      throw error;
    });

    return _result;
 }
 catch(err){
   throw err;
 }
}

var paymentListener = async () => {

  try{
    var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
    var paymentStream = server.payments()
      .forAccount('GDVYOD3NVMGDSBAOLGXPNPHACBKAGQJDM5XSAEEWKMYB2EGLKDXMWAJU')// take account from redis
      .cursor('now')
      .stream({
        onmessage: function(payment) { 
          console.log(payment.amount)
        },
        onerror: function(error) {
          console.log('Error:', error);
          throw error;
        }
      });
    }
    catch(error){
      console.log('Error:', error);
    }
}

app.listen(4000,()=>{
    console.log(4000+" portu dinleniyor");
    paymentListener();
});
  
