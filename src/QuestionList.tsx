import { useEffect, useState } from "react";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "./components/ui/accordion";
import { Input } from "./components/ui/input";
import { Textarea } from "./components/ui/textarea";
import { Button } from "./components/ui/button";

// const appUrl =
// 	"https://script.google.com/macros/s/AKfycbxd9Iedp8GtIiArMfLtJLIn4_-GBJ55S0EohNWn6J8-/dev";

function hasChineseCharacter(text: string) {
	return /[\u4e00-\u9fff]/.test(text);
}

function convertToRuby(data: any) {
	let result = "";
	data.forEach((item: any) => {
		if (item.kana && hasChineseCharacter(item.surface)) {
			result += `<ruby>${item.surface}<rp>(</rp><rt>${item.kana}</rt><rp>)</rp></ruby>`;
		} else {
			result += item.surface;
		}
	});
	return result;
}

export default function QuestionList() {
	// @ts-ignore
	const [deployId, setDeployId] = useState(
		localStorage.getItem("deployId") || ""
	);
	const [newQuestion, setNewQuestion] = useState("");
	const [newAnswer, setNewAnswer] = useState("");
	const [loading, setLoading] = useState(false);
	const [questions, setQuestions] = useState([]);
	const [rowNumber, setRowNumber] = useState(null);

	const appUrl = `https://script.google.com/macros/s/${deployId}/exec`;

	const getQuestions = async () => {
		try {
			const response = await fetch(appUrl);
			const data = await response.json();
			console.log(data);
			setQuestions(data);
		} catch (error) {
			console.error(error);
		}
	};

	const translateAnswer = async () => {
		if (newAnswer.trim() === "") {
			alert("请填写答案");
			return;
		}

		try {
			const params = new URLSearchParams();
			params.set("text", newAnswer);
			const vercelUrl = `https://kanji2kana-service.vercel.app/tokenize?${params.toString()}`;
			const response = await fetch(vercelUrl);
			const data = await response.json();
			console.log(data);
			setNewAnswer(convertToRuby(data));
		} catch (error) {
			console.error(error);
		}
	};

	const handleAddQuestion = async () => {
		if (newQuestion.trim() === "" || newAnswer.trim() === "") {
			alert("请填写问题和答案");
			return;
		}
		try {
			setLoading(true);
			const response = await fetch(appUrl, {
				method: "POST",
				mode: "no-cors",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					value1: newQuestion,
					value2: newAnswer,
					rowNumber: rowNumber,
				}),
			});
			const data = await response.json();
			console.log(data);
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
			setNewQuestion("");
			setNewAnswer("");
			setRowNumber(null);
			getQuestions();
		}
	};

	const handleEditQuestion = async (obj: any) => {
		setRowNumber(obj.index);
		setNewQuestion(obj.question);
		setNewAnswer(obj.answer);
	};

	useEffect(() => {
		getQuestions();
	}, []);

	return (
		<div className="w-full max-w-full mx-auto p-4">
			<h1 className="text-2xl font-bold mb-4">常见问题</h1>
			<Accordion
				type="multiple"
				value={questions.map((_, index) => `item-${index}`)}
				className="mb-6"
			>
				{questions.map((item, index) => (
					<AccordionItem key={index} value={`item-${index}`}>
						<AccordionTrigger>{item[0]}</AccordionTrigger>
						<AccordionContent>
							<div dangerouslySetInnerHTML={{ __html: item[1] }}></div>
							<Button
								variant="link"
								size="icon"
								onClick={() =>
									handleEditQuestion({
										index: index + 1,
										question: item[0],
										answer: item[1],
									})
								}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									width="24"
									height="24"
								>
									<path
										d="M3 17.25V21h3.75l11-11.03-3.75-3.75L3 17.25zm16.71-9.04c.39-.39.39-1.02 0-1.41l-2.54-2.54c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
										fill="none"
										stroke="#B0BEC5"
										stroke-width="1"
									/>
								</svg>
							</Button>
						</AccordionContent>
					</AccordionItem>
				))}
			</Accordion>

			<div className="space-y-4">
				<h2 className="text-xl font-semibold">添加新问题</h2>
				<Input
					placeholder="输入 deploy id"
					value={deployId}
					onChange={(e) => localStorage.setItem("deployId", e.target.value)}
				/>
				<Input
					placeholder="输入问题"
					value={newQuestion}
					onChange={(e) => setNewQuestion(e.target.value)}
				/>
				<Textarea
					placeholder="输入答案"
					value={newAnswer}
					onChange={(e) => setNewAnswer(e.target.value)}
				/>
				<Button onClick={translateAnswer} className="mr-1">
					翻译答案
				</Button>
				<Button onClick={handleAddQuestion} disabled={loading}>
					添加问题
				</Button>
				<div
					className="text-lg text-gray-500"
					dangerouslySetInnerHTML={{ __html: newAnswer }}
				></div>
			</div>
		</div>
	);
}
