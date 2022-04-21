'use strict'
const { ethers } =  require("ethers");
const jsonABI = require("./abi/gohm-eth-abi.json")

const getCurrentGOHMLiquidity = async() => {
    let gOHMLiquidity = "";
    const provider = new ethers.providers.JsonRpcProvider("https://speedy-nodes-nyc.moralis.io/0f6aa643f70545beebc8e4f9/arbitrum/mainnet");
    const contract = new ethers.Contract(
        "0xaa5bD49f2162ffdC15634c87A77AC67bD51C6a6D",
        jsonABI.result,
        provider
    );
    try{
        const result = await contract.getReserves();
        gOHMLiquidity = ethers.utils.formatUnits(result._reserve1, 18);
        console.log("gOHM one sided liquidity in Sushiswap Arbitrum:", gOHMLiquidity, "gOHM");
    } catch(err){
        console.log(err);
    }
    return gOHMLiquidity;
}

getCurrentGOHMLiquidity();