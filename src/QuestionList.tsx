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
	const [deployId, setDeployId] = useState(
		localStorage.getItem("deployId") || ""
	);
	const [newQuestion, setNewQuestion] = useState("");
	const [newAnswer, setNewAnswer] = useState("");
	const [translatedAnswer, setTranslatedAnswer] = useState("");
	const [loading, setLoading] = useState(false);
	const [questions, setQuestions] = useState([]);
	const [rowNumber, setRowNumber] = useState(null);
	const [isTranslate, setIsTranslate] = useState(false);
	const [isLargeSize, setIsLargeSize] = useState(false);

	const appUrl = `https://script.google.com/macros/s/${deployId}/exec`;

	const getQuestions = async () => {
		if (!deployId) {
			return;
		}
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
			setLoading(true);
			const params = new URLSearchParams();
			params.set("text", newAnswer);
			const vercelUrl = `https://kanji2kana-service.vercel.app/tokenize?${params.toString()}`;
			const response = await fetch(vercelUrl);
			const data = await response.json();
			console.log(data);
			setTranslatedAnswer(convertToRuby(data));
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
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
					value3: translatedAnswer,
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
			setTranslatedAnswer("");
			setRowNumber(null);
			getQuestions();
		}
	};

	const handleEditQuestion = async (obj: any) => {
		setRowNumber(obj.index);
		setNewQuestion(obj.question);
		setNewAnswer(obj.answer);
	};

	function playAudio(text: string) {
		// 创建一个新的SpeechSynthesisUtterance实例
		const utterance = new SpeechSynthesisUtterance(text);
		// 日语
		utterance.lang = "ja-JP";
		// 开始朗读
		speechSynthesis.speak(utterance);
	}

	useEffect(() => {
		getQuestions();
	}, []);

	return (
		<div className="w-full max-w-full mx-auto p-4">
			<h1 className="text-2xl font-bold mb-4">常见问题</h1>
			<Accordion
				type="multiple"
				// value={questions.map((_, index) => `item-${index}`)}
				className="mb-6"
			>
				{questions.map((item, index) => (
					<AccordionItem key={index} value={`item-${index}`}>
						<AccordionTrigger>
							{index + 1}. {item[0]}
						</AccordionTrigger>
						<AccordionContent>
							<div
								className={isLargeSize ? "text-lg" : ""}
								dangerouslySetInnerHTML={{
									__html: isTranslate ? item[2] : item[1],
								}}
							></div>
							<Button
								variant="link"
								size="icon"
								onClick={() => {
									handleEditQuestion({
										index: index + 1,
										question: item[0],
										answer: item[1],
									});
									window.scrollTo(0, document.body.scrollHeight);
								}}
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
							<Button
								variant="link"
								size="icon"
								onClick={() => {
									setIsTranslate(!isTranslate);
								}}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									width="24"
									height="24"
								>
									<path
										d="M7 4v4h13v2H7v4L3 9l4-5zm10 10v4H4v2h13v4l4-5-4-5z"
										fill="#B0BEC5"
									/>
								</svg>
							</Button>
							<Button
								variant="link"
								size="icon"
								onClick={() => {
									setIsLargeSize(!isLargeSize);
								}}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									width="24"
									height="24"
								>
									<path
										d="M12 5v14M5 12h14"
										stroke="#B0BEC5"
										stroke-width="2"
										fill="none"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
							</Button>
							<Button
								variant="link"
								size="icon"
								onClick={() => {
									playAudio(item[0]);
								}}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									width="24"
									height="24"
								>
									<circle
										cx="12"
										cy="12"
										r="10"
										stroke="#B0BEC5"
										stroke-width="2"
										fill="none"
									/>
									<polygon points="10,8 16,12 10,16" fill="#B0BEC5" />
								</svg>
							</Button>
							<Button
								variant="link"
								size="icon"
								onClick={() => {
									playAudio(item[1]);
								}}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									width="24"
									height="24"
								>
									<circle
										cx="12"
										cy="12"
										r="10"
										stroke="#B0BEC5"
										stroke-width="2"
										fill="none"
									/>
									<polygon points="10,8 16,12 10,16" fill="#B0BEC5" />
								</svg>
							</Button>
						</AccordionContent>
					</AccordionItem>
				))}
			</Accordion>

			<div className="space-y-4">
				<h2 className="text-xl font-semibold">
					{rowNumber === null ? "添加新问题" : "编辑问题"}
				</h2>
				<Input
					placeholder="输入 deploy id"
					value={deployId}
					onChange={(e) => {
						setDeployId(e.target.value);
						localStorage.setItem("deployId", e.target.value);
					}}
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
				<Button onClick={translateAnswer} className="mr-1" disabled={loading}>
					翻译答案
				</Button>
				<Button onClick={handleAddQuestion} disabled={loading}>
					{rowNumber === null ? "添加问题" : "编辑问题"}
				</Button>
				<div
					className="text-lg text-gray-500"
					dangerouslySetInnerHTML={{ __html: translatedAnswer }}
				></div>
			</div>
		</div>
	);
}
