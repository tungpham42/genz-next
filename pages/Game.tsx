"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Card,
  Button,
  Typography,
  Spin,
  message,
  Progress,
  Space,
  Layout,
  Result,
  Radio,
  Tag,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  TrophyOutlined,
  PlayCircleOutlined,
  CopyOutlined,
  HomeOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useRouter } from "next/navigation"; // CHANGED: from react-router-dom
import { GenZTerm } from "@/types"; // Ensure path is correct
import Link from "next/link";

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;

// --- CẤU HÌNH ---
const LEVELS = [
  { value: 5, label: "Tập sự", color: "green" },
  { value: 10, label: "Thành thạo", color: "blue" },
  { value: 20, label: "Trùm cuối", color: "red" },
];

const TIME_PER_QUESTION = 15;

interface Question {
  target: GenZTerm;
  options: GenZTerm[];
  correctTerm: string;
}

// Helper: Shuffle Array
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const getKhaKhiaMessage = (score: number, total: number) => {
  const ratio = score / total;
  if (ratio === 1) return "Ghê chưa ghê chưa! Gen Z chúa tể ngôn từ! 👑";
  if (ratio >= 0.8) return "Cũng ra gì đấy! Sắp thành 'Idol Tóp Tóp'! 😎";
  if (ratio >= 0.5) return "Kiến thức này đã được tiếp thu, nhưng chưa đủ! 🤔";
  return "Tối cổ quá rồi fen ơi! Về trang chủ học bài đi! 🗿";
};

const Game: React.FC = () => {
  const router = useRouter(); // CHANGED: useNavigate -> useRouter

  // --- STATE ---
  const [data, setData] = useState<GenZTerm[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Game Settings
  const [selectedLevel, setSelectedLevel] = useState<number>(10);

  // Game Play State
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameEnded, setGameEnded] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [score, setScore] = useState<number>(0);
  const [questionCount, setQuestionCount] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  // Timer State
  const [timeLeft, setTimeLeft] = useState<number>(TIME_PER_QUESTION);

  // High Scores
  const [highScores, setHighScores] = useState<Record<number, number>>({
    5: 0,
    10: 0,
    20: 0,
  });

  // --- EFFECT: Load Data & High Scores ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://genz-db.netlify.app/api/dictionary"
        );
        setData(response.data);

        // Note: window/localStorage is only available in useEffect in Next.js
        // to prevent Server-Side Rendering mismatch errors.
        const savedScores = localStorage.getItem("genz_highscores_db");
        if (savedScores) {
          try {
            setHighScores(JSON.parse(savedScores));
          } catch (e) {
            console.error("Lỗi parse high score cũ", e);
          }
        }

        setLoading(false);
      } catch (error) {
        message.error("Lỗi mạng rồi fen ơi!");
        console.error("Lỗi tải dữ liệu:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- LOGIC ---

  const generateQuestion = useCallback(() => {
    if (!data || data.length < 4) {
      message.warning("Dữ liệu chưa tải xong hoặc không đủ câu hỏi!");
      return;
    }

    const randomIndex = Math.floor(Math.random() * data.length);
    const targetItem = data[randomIndex];

    if (!targetItem || !targetItem.term) return;

    const potentialDistractors = data.filter(
      (item) =>
        item.term && item.term.toLowerCase() !== targetItem.term.toLowerCase()
    );

    const shuffledDistractors = shuffleArray(potentialDistractors);
    const distractors = shuffledDistractors.slice(0, 3);

    if (distractors.length < 3) return;

    const allOptions = shuffleArray([targetItem, ...distractors]);

    setCurrentQuestion({
      target: targetItem,
      options: allOptions,
      correctTerm: targetItem.term,
    });

    setSelectedAnswer(null);
    setTimeLeft(TIME_PER_QUESTION);
  }, [data]);

  const handleNextQuestion = () => {
    if (questionCount >= selectedLevel) {
      setGameEnded(true);
    } else {
      setQuestionCount((prev) => prev + 1);
      generateQuestion();
    }
  };

  const handleTimeout = () => {
    message.error("Hết giờ rồi fen ơi! Xu cà na 😭");
    setSelectedAnswer("TIMEOUT");
    setTimeout(handleNextQuestion, 1500);
  };

  // --- EFFECT: Timer Logic (Đếm ngược) ---
  useEffect(() => {
    // Chỉ chạy khi game đã bắt đầu, chưa kết thúc, chưa chọn đáp án và thời gian còn > 0
    if (!gameStarted || gameEnded || selectedAnswer || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameEnded, selectedAnswer, timeLeft]);

  // --- EFFECT: Handle Timeout (Xử lý khi hết giờ) ---
  useEffect(() => {
    // Tách logic này ra để tránh lỗi "setState inside effect"
    if (timeLeft === 0 && !selectedAnswer && gameStarted && !gameEnded) {
      handleTimeout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, selectedAnswer, gameStarted, gameEnded]);

  // --- EFFECT: Save High Score ---
  useEffect(() => {
    if (gameEnded) {
      const currentHighScore = highScores[selectedLevel] || 0;
      if (score > currentHighScore) {
        const newHighScores = { ...highScores, [selectedLevel]: score };
        setHighScores(newHighScores);
        localStorage.setItem(
          "genz_highscores_db",
          JSON.stringify(newHighScores)
        );
        message.success({
          content: `Kỷ lục mới mức ${selectedLevel} câu! Đỉnh của chóp!`,
          icon: <TrophyOutlined style={{ color: "#faad14" }} />,
        });
      }
    }
  }, [gameEnded, score, selectedLevel, highScores]);

  const handleAnswer = (term: string) => {
    if (selectedAnswer || !currentQuestion) return;
    setSelectedAnswer(term);

    if (term === currentQuestion.correctTerm) {
      setScore((prev) => prev + 1);
      message.success({
        content: "Chuẩn cơm mẹ nấu! +1",
        icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
        duration: 1,
      });
    } else {
      message.error({
        content: "Sai bét rồi!",
        icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
        duration: 1,
      });
    }

    setTimeout(handleNextQuestion, 1000);
  };

  const startGame = () => {
    if (data.length < selectedLevel && data.length > 0) {
      message.warning(
        `Chỉ có ${data.length} từ trong từ điển. Sẽ chơi tối đa số từ này.`
      );
    }
    setGameStarted(true);
    setGameEnded(false);
    setScore(0);
    setQuestionCount(1);
    generateQuestion();
  };

  const getTimerColor = () => {
    if (timeLeft > 10) return "#52c41a";
    if (timeLeft > 5) return "#faad14";
    return "#ff4d4f";
  };

  if (loading)
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spin size="large" />
      </div>
    );

  // --- RENDER ---
  return (
    <Layout style={{ minHeight: "100vh", background: "transparent" }}>
      <div style={{ padding: 16 }}>
        <Link href="/">
          <Button icon={<HomeOutlined />}>Quay lại Từ điển</Button>
        </Link>
      </div>

      <Content style={styles.container}>
        {/* MÀN HÌNH KẾT QUẢ */}
        {gameEnded ? (
          <Card style={styles.card}>
            <Result
              status={score > selectedLevel / 2 ? "success" : "warning"}
              icon={
                <TrophyOutlined
                  style={{
                    color:
                      score > (highScores[selectedLevel] || 0)
                        ? "#fadb14"
                        : "#1890ff",
                  }}
                />
              }
              title={
                score >= (highScores[selectedLevel] || 0) && score > 0
                  ? "KỶ LỤC MỚI! 🏆"
                  : "Hết nước chấm!"
              }
              subTitle={
                <div>
                  <Tag color="purple" style={{ marginBottom: 8 }}>
                    Level: {selectedLevel} câu
                  </Tag>{" "}
                  <br />
                  Kết quả:{" "}
                  <b>
                    {score}/{selectedLevel}
                  </b>
                  <br />
                  High Score: <b>{highScores[selectedLevel] || 0}</b>
                </div>
              }
              extra={[
                <Button
                  type="primary"
                  key="replay"
                  onClick={startGame}
                  shape="round"
                  icon={<PlayCircleOutlined />}
                >
                  Chơi lại
                </Button>,
                <Button
                  key="change"
                  onClick={() => {
                    setGameEnded(false);
                    setGameStarted(false);
                  }}
                >
                  Đổi Level
                </Button>,
              ]}
            >
              <div
                style={{
                  textAlign: "center",
                  background: "#f9f9f9",
                  padding: 15,
                  borderRadius: 8,
                  marginBottom: 20,
                }}
              >
                <Text strong style={{ color: "#722ed1" }}>
                  &ldquo;{getKhaKhiaMessage(score, selectedLevel)}&rdquo;
                </Text>
              </div>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Button
                  block
                  icon={<CopyOutlined />}
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `Tui đạt ${score}/${selectedLevel} điểm Gen Z Game!`
                    );
                    message.success("Đã copy!");
                  }}
                >
                  Copy kết quả
                </Button>
              </Space>
            </Result>
          </Card>
        ) : !gameStarted ? (
          /* MÀN HÌNH START */
          <Card style={styles.card} hoverable>
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <Title level={1} style={{ color: "#722ed1" }}>
                GEN Z GAME
              </Title>

              <Paragraph type="secondary">
                Chọn độ khó để thử thách bản thân:
              </Paragraph>

              <div style={{ marginBottom: 24 }}>
                <Radio.Group
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  buttonStyle="solid"
                >
                  {LEVELS.map((lvl) => (
                    <Radio.Button key={lvl.value} value={lvl.value}>
                      {lvl.label} ({lvl.value})
                    </Radio.Button>
                  ))}
                </Radio.Group>
              </div>

              <div
                style={{
                  marginBottom: 20,
                  padding: 10,
                  background: "#fffbe6",
                  borderRadius: 8,
                  border: "1px solid #ffe58f",
                }}
              >
                <ThunderboltOutlined style={{ color: "#faad14" }} />
                <Text strong style={{ marginLeft: 8 }}>
                  Kỷ lục ({selectedLevel} câu): {highScores[selectedLevel] || 0}
                </Text>
              </div>

              <Button
                type="primary"
                size="large"
                onClick={startGame}
                style={{
                  background:
                    "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
                  border: 0,
                  height: 50,
                  padding: "0 40px",
                  fontSize: 18,
                }}
              >
                Gét Gô!
              </Button>
            </div>
          </Card>
        ) : (
          /* MÀN HÌNH GAMEPLAY */
          <Card style={{ ...styles.card, maxWidth: 600, position: "relative" }}>
            {/* TIMER PROGRESS CIRCLE */}
            <div style={{ position: "absolute", top: 20, right: 20 }}>
              <Progress
                type="circle"
                percent={(timeLeft / TIME_PER_QUESTION) * 100}
                format={() => `${timeLeft}s`}
                width={50}
                strokeColor={getTimerColor()}
              />
            </div>

            <div
              style={{
                marginBottom: 20,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <Space>
                <Tag color="purple">Level: {selectedLevel}</Tag>
                <Tag color="gold">Điểm: {score}</Tag>
              </Space>

              <Text strong style={{ marginTop: 10 }}>
                Câu {questionCount}/{selectedLevel}
              </Text>
            </div>

            <Progress
              percent={(questionCount / selectedLevel) * 100}
              showInfo={false}
              status="active"
              strokeColor={{ "0%": "#108ee9", "100%": "#87d068" }}
            />

            <div style={{ textAlign: "center", margin: "30px 0" }}>
              <Text type="secondary">Thuật ngữ này nghĩa là gì?</Text>
              <Title
                level={2}
                style={{ color: "#1890ff", textTransform: "uppercase" }}
              >
                &ldquo;{currentQuestion?.target.term}&rdquo;
              </Title>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
              {currentQuestion?.options.map((item, index) => {
                const isSelected = selectedAnswer === item.term;
                const isCorrect = item.term === currentQuestion?.correctTerm;

                let btnStyle: React.CSSProperties = {
                  height: "auto",
                  padding: "15px",
                  whiteSpace: "normal",
                  textAlign: "left",
                  fontSize: 16,
                };

                if (selectedAnswer) {
                  if (isCorrect)
                    btnStyle = {
                      ...btnStyle,
                      background: "#f6ffed",
                      borderColor: "#b7eb8f",
                      color: "#389e0d",
                    };
                  else if (isSelected)
                    btnStyle = {
                      ...btnStyle,
                      background: "#fff1f0",
                      borderColor: "#ffa39e",
                      color: "#cf1322",
                    };
                  else btnStyle = { ...btnStyle, opacity: 0.5 };
                }

                return (
                  <Button
                    key={index}
                    block
                    size="large"
                    onClick={() => handleAnswer(item.term)}
                    disabled={!!selectedAnswer}
                    style={btnStyle}
                  >
                    {item.definition}
                  </Button>
                );
              })}
            </div>
          </Card>
        )}
      </Content>
    </Layout>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 500,
    borderRadius: 16,
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  },
};

export default Game;
