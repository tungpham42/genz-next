"use client";
import React from "react";
import { Card, Tag, Typography, Button, Tooltip, message } from "antd";
import { ShareAltOutlined, CopyOutlined } from "@ant-design/icons";
import { GenZTerm } from "@/types";

const { Title, Text } = Typography;

interface Props {
  data: GenZTerm;
  highlight?: string; // Thêm prop highlight (optional)
}

// Function to generate consistent pastel colors based on tag length
const getTagColor = (tag: string) => {
  const colors = [
    "magenta",
    "red",
    "volcano",
    "orange",
    "gold",
    "lime",
    "green",
    "cyan",
    "blue",
    "geekblue",
    "purple",
  ];
  const index = tag.length % colors.length;
  return colors[index];
};

const TermCard: React.FC<Props> = ({ data, highlight = "" }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(`${data.term}: ${data.definition}`);
    message.success("Đã copy vào clipboard nè! ✨");
  };

  const handleShare = async () => {
    const shareData = {
      title: `Gen Z Dictionary: ${data.term}`,
      text: `Ê biết từ "${data.term}" là gì hông? Nghĩa là: ${data.definition} đó. \nVí dụ: "${data.example}"`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.text);
        message.success("Đã copy nội dung, gửi cho hội chị em ngay đi! 🚀");
      }
    } catch (err) {
      console.log("User cancelled share", err);
    }
  };

  // --- HÀM TÔ MÀU TỪ KHÓA ---
  const getHighlightedText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    // Escape các ký tự đặc biệt trong regex
    const escapeRegExp = (string: string) =>
      string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escapeRegExp(highlight)})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span
          key={index}
          style={{
            backgroundColor: "#fffb8f", // Màu vàng highlight
            color: "#000",
            padding: "0 2px",
            borderRadius: "4px",
            boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
          }}
        >
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <Card
      hoverable
      style={{
        width: "100%",
        marginBottom: 24,
        borderRadius: 24,
        border: "none",
        boxShadow: "0 10px 40px -10px rgba(0,0,0,0.05)",
        background: "#FFFFFF",
        overflow: "hidden",
        position: "relative",
      }}
      styles={{ body: { padding: "24px 28px" } }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "6px",
          background:
            "linear-gradient(90deg, #FF9A9E 0%, #FECFEF 99%, #FECFEF 100%)",
        }}
      />

      {/* Header Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 12,
        }}
      >
        <div>
          <Title
            level={3}
            style={{
              color: "#2d3748",
              margin: 0,
              fontWeight: 800,
              fontSize: "1.75rem",
            }}
          >
            {/* Highlight Term */}
            {getHighlightedText(data.term, highlight)}
          </Title>
          <div style={{ marginTop: 8 }}>
            {data.tags.map((tag) => (
              <Tag
                key={tag}
                color={getTagColor(tag)}
                bordered={false}
                style={{
                  borderRadius: 12,
                  padding: "4px 10px",
                  marginRight: 6,
                  marginBottom: 6,
                  fontWeight: 600,
                  fontSize: "12px",
                }}
              >
                #{tag}
              </Tag>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <Tooltip title="Copy định nghĩa">
            <Button
              shape="circle"
              icon={<CopyOutlined style={{ color: "#718096" }} />}
              onClick={handleCopy}
              style={{ border: "none", background: "#EDF2F7" }}
            />
          </Tooltip>
          <Tooltip title="Share ngay">
            <Button
              shape="circle"
              icon={<ShareAltOutlined style={{ color: "#718096" }} />}
              onClick={handleShare}
              style={{ border: "none", background: "#EDF2F7" }}
            />
          </Tooltip>
        </div>
      </div>

      {/* Definition */}
      <div style={{ marginBottom: 20 }}>
        <Text
          style={{
            fontSize: "17px",
            lineHeight: "1.6",
            color: "#4A5568",
            fontWeight: 400,
          }}
        >
          {/* Highlight Definition */}
          {getHighlightedText(data.definition, highlight)}
        </Text>
      </div>

      {/* Example Box */}
      <div
        style={{
          background: "#F7FAFC",
          padding: "16px 20px",
          borderRadius: "16px",
          borderLeft: "4px solid #8B5CF6",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <Text
          type="secondary"
          style={{
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: "1px",
            fontWeight: 700,
            color: "#A0AEC0",
          }}
        >
          Ví dụ minh họa:
        </Text>
        <Text
          style={{
            fontSize: "16px",
            color: "#553C9A",
            fontStyle: "italic",
            fontFamily: "Lexend Deca",
          }}
        >
          {/* Highlight Example */}
          &ldquo;{getHighlightedText(data.example, highlight)}&rdquo;
        </Text>
      </div>
    </Card>
  );
};

export default TermCard;
