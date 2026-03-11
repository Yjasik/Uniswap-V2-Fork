// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {MyToken} from "../src/tokens/MyToken.sol";
import {WETH9} from "../src/tokens/WETH9.sol";

// Адреса уже развернутых контрактов Uniswap V2 в Sepolia
address constant UNISWAP_V2_FACTORY = 0x7E0987E5b3a30e3f2828572Bb659A548460a3003;
address constant UNISWAP_V2_ROUTER = 0xc532A74256D3d8D5e2D6a6d4f66b4D9B2E3c9D5A;

contract DeployTokensScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        vm.startBroadcast(deployerPrivateKey);

        // Деплой WETH
        WETH9 weth = new WETH9();
        console.log("WETH deployed at:", address(weth));

        // Деплой тестовых токенов
        MyToken usdc = new MyToken("USDC", "USDC", 1000000);
        MyToken dai = new MyToken("DAI", "DAI", 1000000);
        console.log("USDC deployed at:", address(usdc));
        console.log("DAI deployed at:", address(dai));

        // Создание пар с получением адресов
        address pairWethUsdc = address(0);
        address pairWethDAI = address(0);

        // Для USDC/WETH
        (bool success1, bytes memory data1) = UNISWAP_V2_FACTORY.call(
            abi.encodeWithSignature("createPair(address,address)", address(usdc), address(weth))
        );
        require(success1, "Failed to create USDC/WETH pair");
        
        // Получаем адрес созданной пары
        if (data1.length > 0) {
            pairWethUsdc = abi.decode(data1, (address));
        } else {
            // Если данных нет, получаем адрес через getPair
            (bool success, bytes memory pairData) = UNISWAP_V2_FACTORY.call(
                abi.encodeWithSignature("getPair(address,address)", address(usdc), address(weth))
            );
            if (success && pairData.length > 0) {
                pairWethUsdc = abi.decode(pairData, (address));
            }
        }
        console.log("USDC/WETH pair created at:", pairWethUsdc);

        // Для DAI/WETH
        (bool success2, bytes memory data2) = UNISWAP_V2_FACTORY.call(
            abi.encodeWithSignature("createPair(address,address)", address(dai), address(weth))
        );
        require(success2, "Failed to create DAI/WETH pair");
        
        // Получаем адрес созданной пары
        if (data2.length > 0) {
            pairWethDAI = abi.decode(data2, (address));
        } else {
            // Если данных нет, получаем адрес через getPair
            (bool success, bytes memory pairData) = UNISWAP_V2_FACTORY.call(
                abi.encodeWithSignature("getPair(address,address)", address(dai), address(weth))
            );
            if (success && pairData.length > 0) {
                pairWethDAI = abi.decode(pairData, (address));
            }
        }
        console.log("DAI/WETH pair created at:", pairWethDAI);

        vm.stopBroadcast();

        console.log("");
        console.log("=== ADDRESSES TO COPY TO FRONTEND ===");
        console.log("WETH_ADDRESS:", address(weth));
        console.log("USDC_ADDRESS:", address(usdc));
        console.log("DAI_ADDRESS:", address(dai));
        console.log("PAIR_WETH_USDC_ADDRESS:", pairWethUsdc);
        console.log("PAIR_WETH_DAI_ADDRESS:", pairWethDAI);
        console.log("======================================");
    }
}