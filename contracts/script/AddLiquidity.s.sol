// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {MyToken} from "../src/tokens/MyToken.sol";

address constant UNISWAP_V2_FACTORY = 0x7E0987E5b3a30e3f2828572Bb659A548460a3003;
address constant UNISWAP_V2_ROUTER = 0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008;
address constant DAI = 0xBf88Fd58B7e44d1eE04F7a2C73adD15E74b38FB5;
address constant WETH = 0xef60C5dE54576037335212D930Ae96BD5bdbdD21;

interface IUniswapV2Router02 {
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB, uint liquidity); 
}

interface IUniswapV2Factory {
    function getPair(address tokenA, address tokenB) external view returns (address pair);
}

interface IUniswapV2Pair {
    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 value) external returns (bool);
}

contract AddLiq is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        vm.startBroadcast(deployerPrivateKey);

        IUniswapV2Router02 router = IUniswapV2Router02(UNISWAP_V2_ROUTER);
        IUniswapV2Factory factory = IUniswapV2Factory(UNISWAP_V2_FACTORY);

        
        // 1. Получаем существующую пару
        address pair = factory.getPair(DAI, WETH);
        console.log("Existing pair:", pair);

        // Проверяем, что пара существует
        require(pair != address(0), "Pair does not exist");
        
        // 2. Проверяем резервы
        (uint112 reserve0, uint112 reserve1,) = IUniswapV2Pair(pair).getReserves();
        console.log("Current reserves - DAI:", uint256(reserve0) / 1e18, "DAI");
        console.log("Current reserves - WETH:", uint256(reserve1) / 1e6, "WETH"); 

        // 3. Проверяем балансы
        uint256 daiBalance = MyToken(DAI).balanceOf(deployer);
        uint256 wethBalance = MyToken(WETH).balanceOf(deployer);

        console.log("Your DAI balance:", daiBalance / 1e18, "DAI");
        console.log("Your WETH balance:", wethBalance / 1e18, "WETH");      
        
        uint256 wethToAdd = 100 * 1e18  ; 
        uint256 daiToAdd = 400000 * 1e18;   
        
        console.log("Adding new liquidity with ratio 1 ETH = 4000 USDC");
        console.log("DAI to add:", daiToAdd / 1e18, "DAI");
        console.log("WETH to add:", wethToAdd / 1e18, "WETH");
        
        require(daiBalance >= daiToAdd, "Not enough DAI");
        require(wethBalance >= wethToAdd, "Not enough WETH");
        
        console.log("DAI balance:", daiBalance / 1e18, "DAI");
        console.log("WETH balance:", wethBalance / 1e18, "WETH");
        
        // 4. Одобряем токены для Router
        MyToken(DAI).approve(UNISWAP_V2_ROUTER, daiToAdd);
        MyToken(WETH).approve(UNISWAP_V2_ROUTER, wethToAdd);

        console.log("Tokens approved");
        
        // Добавляем ликвидность
        (uint amountDai, uint amountWeth, uint liquidity) = router.addLiquidity({
            tokenA: DAI,
            tokenB: WETH,
            amountADesired: daiToAdd,
            amountBDesired: wethToAdd,
            amountAMin: 1,
            amountBMin: 1,
            to: deployer,
            deadline: block.timestamp + 1 hours
        }
        );
        
        console.log("========================================");
        console.log(" Liquidity ratio fixed!");
        console.log("========================================");
        console.log("DAI added:", amountDai / 1e18, "DAI");
        console.log("WETH added:", amountWeth / 1e18, "WETH");
        console.log("LP tokens:", liquidity);
        console.log("New reserves - DAI:", (uint256(reserve0) + amountDai) / 1e18, "WETH");
        console.log("New reserves - WETH:", (uint256(reserve1) + amountWeth) / 1e6, "USDC");
        console.log("========================================");

        // Новый расчет резервов
        (reserve0, reserve1,) = IUniswapV2Pair(pair).getReserves();
        console.log("New reserves - DAI:", uint256(reserve0) / 1e18, "DAI");
        console.log("New reserves - WETH:", uint256(reserve1) / 1e18, "WETH");
        console.log("========================================");

        vm.stopBroadcast();
    }
}