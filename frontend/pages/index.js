import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

export default function Home() {
  return (
    <div>
      <Title level={2}>单词记忆首页</Title>
      <Paragraph>欢迎使用 AI 单词记忆系统，在这里开始你的单词学习之旅。</Paragraph>
    </div>
  );
}
