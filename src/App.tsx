import React from "react";
import { useCallback, useEffect, useState } from "@lynx-js/react";
import "./App.css";
import arrow from "./assets/arrow.png";
import lynxLogo from "./assets/lynx-logo.png";
import reactLynxLogo from "./assets/react-logo.png";

export function App() {
	const [alterLogo, setAlterLogo] = useState(false);
	const [count, setCount] = useState(0); // Добавляем состояние для счётчика

	useEffect(() => {
		console.info("Hello, ReactLynx");
	}, []);

	const onTap = useCallback(() => {
		setAlterLogo(!alterLogo); // Убираем 'background only', так как он не нужен
	}, [alterLogo]);

	const handleIncrement = () => {
		setCount((prev) => prev + 1); // Увеличиваем счётчик
	};

	const handleDecrement = () => {
		setCount((prev) => prev - 1); // Уменьшаем счётчик
	};

	return (
		<view>
			<view className="Background" />
			<view className="App">
				<view className="Banner">
					<view
						className="Logo"
						bindtap={onTap}
					>
						{alterLogo ? (
							<image
								src={reactLynxLogo}
								className="Logo--react"
							/>
						) : (
							<image
								src={lynxLogo}
								className="Logo--lynx"
							/>
						)}
					</view>
					<text className="Title">React2</text>
					<text className="Subtitle">on Lynx</text>
				</view>
				<view className="Content">
					<image
						src={arrow}
						className="Arrow"
					/>
					<text className="Description">Tap the logo and have fun!</text>
					<text className="Hint">
						Edit <text style={{ fontStyle: "italic" }}>src/App.tsx </text>
						to see updates!
					</text>
					{/* Добавляем счётчик */}
					<view className="Counter">
						<text className="Count">Count: {count}</text>
						<view className="Buttons">
							<view
								className="Button"
								bindtap={handleIncrement}
							>
								Increment
							</view>
							<view
								className="Button"
								bindtap={handleDecrement}
							>
								Decrement
							</view>
						</view>
					</view>
				</view>
				<view style={{ flex: 1 }} />
			</view>
		</view>
	);
}
