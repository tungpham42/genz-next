"use client";

import React, { useState, useEffect } from "react";
import {
  Layout,
  Input,
  List,
  Typography,
  FloatButton,
  Spin,
  message,
  Tooltip,
} from "antd";
import {
  ArrowUpOutlined,
  SearchOutlined,
  LoadingOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import Link from "next/link";
// Ensure this path is correct based on your Next.js structure
import TermCard from "@/components/TermCard";
import { GenZTerm } from "@/types";

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

const Dictionary: React.FC = () => {
  const [terms, setTerms] = useState<GenZTerm[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        setLoading(true);
        // Note: In Next.js, you might eventually move this API call to a Server Component
        // or a Route Handler (app/api/...), but fetch in useEffect works fine for Client Components.
        const response = await fetch(
          "https://genz-db.netlify.app/api/dictionary"
        );
        if (!response.ok) throw new Error("Không thể tải dữ liệu");
        const data = await response.json();
        setTerms(data);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        message.error("Không thể tải từ điển. Vui lòng thử lại sau!");
      } finally {
        setLoading(false);
      }
    };
    fetchTerms();
  }, []);

  const filteredData = terms
    .filter(
      (item: GenZTerm) =>
        item.term.toLowerCase().includes(searchText.toLowerCase()) ||
        item.definition.toLowerCase().includes(searchText.toLowerCase())
    )
    .sort((a, b) => a.term.localeCompare(b.term, "vi"));

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
    setCurrentPage(1);
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "transparent" }}>
      {/* Header */}
      <Header
        style={{
          background: "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          padding: "16px 24px 8px",
          height: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "sticky",
          top: 0,
          zIndex: 100,
          borderBottom: "1px solid rgba(0,0,0,0.03)",
        }}
      >
        <div
          style={{
            textAlign: "center",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Title
            level={2}
            style={{
              margin: 0,
              fontWeight: 900,
              background: "linear-gradient(to right, #8B5CF6, #EC4899)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Từ điển Gen Z 🤟
          </Title>
          <Text
            style={{ display: "flex", lineHeight: "2rem" }}
            type="secondary"
          >
            Cập nhật ngôn ngữ hệ tư tưởng mới
          </Text>
        </div>

        <div style={{ width: "100%", maxWidth: "500px", marginTop: 10 }}>
          <Input
            placeholder="Hôm nay bạn muốn tra từ gì? (vd: Flex, Trap...)"
            allowClear
            prefix={
              <SearchOutlined
                style={{ color: "rgba(0,0,0,.45)", fontSize: "18px" }}
              />
            }
            size="large"
            onChange={handleSearch}
            value={searchText}
          />
        </div>
      </Header>

      {/* Content */}
      <Content
        style={{
          padding: "32px 24px",
          maxWidth: "768px",
          margin: "0 auto",
          width: "100%",
          minHeight: "60vh",
        }}
      >
        {loading ? (
          <div style={{ textAlign: "center", paddingTop: 80 }}>
            <Spin
              indicator={
                <LoadingOutlined
                  style={{ fontSize: 48, color: "#8B5CF6" }}
                  spin
                />
              }
              tip="Đang tải dữ liệu..."
            />
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 24, textAlign: "left" }}>
              <Text style={{ fontSize: "16px", color: "#718096" }}>
                Tìm thấy{" "}
                <strong style={{ color: "#8B5CF6" }}>
                  {filteredData.length}
                </strong>{" "}
                thuật ngữ uy tín ✨
              </Text>
            </div>
            <List
              grid={{ gutter: 24, xs: 1, sm: 1, md: 1, lg: 1, xl: 1, xxl: 1 }}
              dataSource={filteredData}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: filteredData.length,
                onChange: (page, size) => {
                  setCurrentPage(page);
                  setPageSize(size);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                },
                showSizeChanger: true,
                locale: { items_per_page: "/ trang" },
                showTotal: (total, range) => (
                  <Text type="secondary">
                    Hiển thị {range[0]}-{range[1]} của <strong>{total}</strong>{" "}
                    từ
                  </Text>
                ),
                pageSizeOptions: ["5", "10", "20", "50"],
                position: "bottom",
                align: "center",
                style: { marginTop: 32 },
              }}
              renderItem={(item) => (
                <List.Item style={{ marginBottom: 0 }}>
                  <TermCard data={item} highlight={searchText} />
                </List.Item>
              )}
              locale={{
                emptyText: (
                  <div
                    style={{ padding: 40, textAlign: "center", opacity: 0.6 }}
                  >
                    <div style={{ fontSize: 40, marginBottom: 10 }}>🌚</div>
                    <Text>
                      Hông tìm thấy từ này, quê á! <br /> Thử từ khác đi bà.
                    </Text>
                  </div>
                ),
              }}
            />
          </>
        )}
      </Content>

      <Footer
        style={{
          textAlign: "center",
          background: "transparent",
          color: "#A0AEC0",
          paddingBottom: 40,
        }}
      >
        <Text type="secondary">
          Made with 💜 by Gen Z Dictionary Team ©2025
        </Text>
      </Footer>

      {/* --- CÁC NÚT NỔI (FLOATING BUTTONS) --- */}
      <Link href="/game">
        <Tooltip title="Thử thách Gen Z Game" placement="left">
          <FloatButton
            icon={<TrophyOutlined />}
            type="primary"
            style={{
              right: 24,
              bottom: 84,
              width: 50,
              height: 50,
            }}
            badge={{ dot: true, color: "#ff4d4f" }}
          />
        </Tooltip>
      </Link>

      <FloatButton.BackTop
        icon={<ArrowUpOutlined />}
        type="default"
        style={{ right: 24, bottom: 24 }}
      />
    </Layout>
  );
};

export default Dictionary;
