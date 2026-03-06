// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {UniswapV2Factory} from "@uniswap/v2-core/contracts/UniswapV2Factory.sol";
import {UniswapV2Router02} from "@uniswap/v2-periphery/contracts/UniswapV2Router02.sol";
import {MyToken} from "../src/tokens/MyToken.sol";
import {WETH9} from "../src/tokens/WETH9.sol";


contract DeployAllScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        vm.startBroadcast(deployerPrivateKey);

        // Деплой WETH
        WETH9 weth = new WETH9();
        console.log("WETH deployed at:", address(weth));

        // Деплой Factory
        UniswapV2Factory factory = new UniswapV2Factory(deployer);
        console.log("Factory deployed at:", address(factory));

        // Деплой Router
        UniswapV2Router02 router = new UniswapV2Router02(address(factory), address(weth));
        console.log("Router deployed at:", address(router));

        // Деплой тестовых токенов
        MyToken usdc = new MyToken("USDC", "USDC", 1000000);
        MyToken dai = new MyToken("DAI", "DAI", 1000000);
        console.log("USDC deployed at:", address(usdc));
        console.log("DAI deployed at:", address(dai));

        // Создание пар
        address pairWethUsdc = factory.createPair(address(weth), address(usdc));
        console.log("PairWethUsdc created at:", pairWethUsdc);
        address pairWethDAI = factory.createPair(address(weth), address(dai));
        console.log("PairWethDai created at:", pairWethDAI);

        vm.stopBroadcast();

        // Сохраняем адреса для фронтенда
        console.log("");
        console.log("=== ADDRESSES TO COPY TO FRONTEND ===");
        console.log("WETH_ADDRESS:", address(weth));
        console.log("FACTORY_ADDRESS:", address(factory));
        console.log("ROUTER_ADDRESS:", address(router));
        console.log("USDC_ADDRESS:", address(usdc));
        console.log("DAI_ADDRESS:", address(dai));
        console.log("PAIR_WETH_USDC_ADDRESS:", address(pairWethUsdc));
        console.log("PAIR_WETH_DAI_ADDRESS:", address(pairWethDAI));
        console.log("======================================");
    }
}