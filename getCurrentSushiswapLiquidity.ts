const { ethers } = require("ethers");
const jsonABI = require("./abi/gohm-eth-abi.json");

const ERC20ABI = [
    "function decimals() external view returns (uint8)"
];

const getCurrentSushiswapLiquidity = async(pairAddress, tokenAddress) => {
    let tokenLiquidity = "";
    const provider = new ethers.providers.JsonRpcProvider("https://arb1.arbitrum.io/rpc");
    const contract = new ethers.Contract(
        pairAddress,
        jsonABI.result,
        provider
    );
    const ERC20 = new ethers.Contract(
        tokenAddress,
        ERC20ABI,
        provider
    )
    try{
        const decimals = await ERC20.decimals();
        const token0 = await contract.token0();
        const token1 = await contract.token1();
        const result = await contract.getReserves();
        if(tokenAddress === token0){
            tokenLiquidity = ethers.utils.formatUnits(result._reserve0, decimals);
        } else if(tokenAddress === token1){
            tokenLiquidity = ethers.utils.formatUnits(result._reserve1, decimals);
        } else {
            throw "Token address does not match with any token in this pool!";
        }
        console.log("One sided liquidity in Sushiswap Arbitrum:", tokenLiquidity);
    } catch(err){
        console.log(err);
    }
    return tokenLiquidity;
};

// get one sided liquidity for gOHM in Sushiswap Arbitrum
getCurrentSushiswapLiquidity('0xaa5bD49f2162ffdC15634c87A77AC67bD51C6a6D', '0x8D9bA570D6cb60C7e3e0F31343Efe75AB8E65FB1');