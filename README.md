# stellar_newAsset_payment_backend

1) this code create a new token on stellar network and make payment system with created token
2) stellar network is divided into 2 : public and test
3) this project is mobile payment systems backend project
4) newly created token will be settled in the dockerize redis db.
5) kafka implementation will be settled for the real time payment monitoring

directives:

1) AccountCreate => http://localhost:4000/AccountCreate
2) TokenCreate =>    http://localhost:4000/TokenCreate  
{
  "issuerSecret"	 :"SB552A3K5HEUH6YHJHV5SGZJSFR72ADSPN4HCEBVPCHLR23WKQRYWT72",
  "receiverSecret"       :"SDX52WX4Y4DWXX4IXAJQSIQHTDJ77X7Q6GH5K3C3VOZADLV3BUMPF5L7"
}

3) GetAsset =>  http://localhost:4000/GetAsset 
{
   "publicKey":	"GAATZY5JR6SKJ72VIQ6UZDHKJSJMVC2F5TAKCSJSRFVCDYBFGJOSX3J3"
}

4) GetBalance => http://localhost:4000/GetBalance
{
  "publicKey":"GBJ2HUEDLQ6EUME3JHHJ53HZOXLEGUFAVMRVPBQTAHWYXCHIJKHCBKBO"
}

5) DepositToken  => http://localhost:4000/DepositToken 
{
	"tokenHolderSecret":"SDX52WX4Y4DWXX4IXAJQSIQHTDJ77X7Q6GH5K3C3VOZADLV3BUMPF5L7",
	"tokenBuyerSecret":"SAOECU5PRMDMNMQK5RR3FLJQUJJNNMTILQBUMAQWY27BY7H7Z6WFJP2B",
        "amount":"35"
}
6) MakePayment => http://localhost:4000/MakePayment
{
	"receiverPublicKey":"GDVYOD3NVMGDSBAOLGXPNPHACBKAGQJDM5XSAEEWKMYB2EGLKDXMWAJU",
	"senderSecret":"SDX52WX4Y4DWXX4IXAJQSIQHTDJ77X7Q6GH5K3C3VOZADLV3BUMPF5L7",
        "paymentAmount":"3010"
}
