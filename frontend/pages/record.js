import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

export default function Record() {
  return (
    <div>
      <Title level={2}>学习记录</Title>
      <Paragraph>查看你的单词学习记录与进度。</Paragraph>
    </div>
  );
}
