// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {MyToken} from "../src/tokens/MyToken.sol";

address constant UNISWAP_V2_ROUTER = 0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008;
address constant WETH = 0x17d88f10916A398131c248ae5C025ce93809C3f5;
address constant USDC = 0x044A8172a9e9A5732A3aD1B3385013f4dDCD7D2d;
address constant PAIR_WITH_LIQUIDITY = 0xdcC1ECC92b203cD96f41d910bb38082EE7Af4c5D; // Ваша реальная пара

interface IUniswapV2Router02 {
    function addLiquidityETH(
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external payable returns (uint amountToken, uint amountETH, uint liquidity);
}

interface IUniswapV2Pair {
    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
}

contract AddLiquiditySimple is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        vm.startBroadcast(deployerPrivateKey);

        IUniswapV2Router02 router = IUniswapV2Router02(UNISWAP_V2_ROUTER);
        
        // Используем известный адрес пары с ликвидностью
        address pair = PAIR_WITH_LIQUIDITY;
        console.log("Using known pair with liquidity:", pair);
        
        // Получаем резервы
        (uint112 reserve0, uint112 reserve1,) = IUniswapV2Pair(pair).getReserves();
        console.log("Reserve0 (USDC):", uint256(reserve0) / 1e6, "USDC");
        console.log("Reserve1 (WETH):", uint256(reserve1) / 1e18, "WETH");
        
        // Проверяем, что резервы не нулевые
        require(reserve0 > 0 && reserve1 > 0, "Pair has zero liquidity");
        
        // Рассчитываем курс
        uint256 price = (uint256(reserve0) * 1e18) / uint256(reserve1);
        console.log("Current price: 1 WETH =", price / 1e6, "USDC");
        
        // Проверяем балансы
        uint256 ethBalance = deployer.balance;
        console.log("ETH balance:", ethBalance / 1e18, "ETH");
        
        uint256 usdcBalance = MyToken(USDC).balanceOf(deployer);
        console.log("USDC balance:", usdcBalance / 1e6, "USDC");
        
        // Добавляем небольшую ликвидность
        uint256 ethToAdd = 0.1 ether; // 0.01 ETH
        console.log("ETH to add:", ethToAdd / 1e18, "ETH");
        
        // Рассчитываем сколько USDC нужно
        uint256 usdcNeeded = (ethToAdd * price) / 1e18;
        console.log("USDC needed:", usdcNeeded / 1e6, "USDC");
        
        require(usdcBalance >= usdcNeeded, "Not enough USDC");
        require(ethBalance >= ethToAdd, "Not enough ETH");
        
        // Одобряем USDC
        MyToken(USDC).approve(UNISWAP_V2_ROUTER, usdcNeeded);
        console.log("USDC approved");
        
        // Добавляем ликвидность
        console.log("Adding liquidity to correct pair...");
        
        (uint amountUsdc, uint amountWeth, uint liquidity) = router.addLiquidityETH{value: ethToAdd}(
            USDC,
            usdcNeeded,
            0,
            0,
            deployer,
            block.timestamp + 1 hours
        );
        
        console.log("========================================");
        console.log(" Liquidity added to correct pair!");
        console.log("========================================");
        console.log("USDC added:", amountUsdc / 1e6, "USDC");
        console.log("WETH added:", amountWeth / 1e18, "WETH");
        console.log("LP tokens:", liquidity);
        console.log("========================================");

        vm.stopBroadcast();
    }
}