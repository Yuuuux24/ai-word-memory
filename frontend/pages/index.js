import { Card, Tag, Typography, Empty, Skeleton, Row, Col } from 'antd';
import { SoundOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

// 静态卡片占位示例数据（后续联调时替换为真实 API 数据）
const staticWords = [
  { id: 1, word: 'abandon', phonetic: '/əˈbændən/', meaning: '抛弃，放弃', part_of_speech: 'verb', example_sentence: 'He decided to abandon his old habits.' },
  { id: 2, word: 'brilliant', phonetic: '/ˈbrɪljənt/', meaning: '杰出的，明亮的', part_of_speech: 'adj', example_sentence: 'She had a brilliant idea for the project.' },
  { id: 3, word: 'curious', phonetic: '/ˈkjʊriəs/', meaning: '好奇的', part_of_speech: 'adj', example_sentence: 'The child was curious about everything.' },
  { id: 4, word: 'diligent', phonetic: '/ˈdɪlɪdʒənt/', meaning: '勤奋的', part_of_speech: 'adj', example_sentence: 'A diligent student always finishes homework on time.' },
  { id: 5, word: 'embrace', phonetic: '/ɪmˈbreɪs/', meaning: '拥抱，欣然接受', part_of_speech: 'verb', example_sentence: 'We should embrace new challenges.' },
  { id: 6, word: 'fragile', phonetic: '/ˈfrædʒaɪl/', meaning: '脆弱的，易碎的', part_of_speech: 'adj', example_sentence: 'Be careful, the glass is fragile.' },
];

export default function Home() {
  const loading = false;  // 后续改为真实 loading 状态
  const words = staticWords; // 后续改为 API 数据

  const getPosColor = (pos) => {
    const colorMap = { verb: 'blue', adj: 'green', noun: 'orange', adverb: 'purple', 'verb/noun': 'cyan' };
    return colorMap[pos] || 'default';
  };

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>单词记忆首页</Title>

      {loading ? (
        // Loading 骨架屏
        <Row gutter={[16, 16]}>
          {[1, 2, 3].map((i) => (
            <Col xs={24} sm={12} lg={8} key={i}>
              <Card><Skeleton active paragraph={{ rows: 3 }} /></Card>
            </Col>
          ))}
        </Row>
      ) : words.length === 0 ? (
        // 空数据占位
        <Empty description="暂无单词数据，请先导入" style={{ marginTop: 60 }} />
      ) : (
        // 单词卡片列表
        <Row gutter={[16, 16]}>
          {words.map((item) => (
            <Col xs={24} sm={12} lg={8} key={item.id}>
              <Card
                hoverable
                style={{ borderRadius: 12, height: '100%' }}
                onClick={() => console.log('点击单词:', item.id)} // 后续触发 AI 接口
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                  <Title level={3} style={{ margin: 0, marginRight: 10 }}>
                    {item.word}
                  </Title>
                  <SoundOutlined style={{ color: '#1677ff', fontSize: 18, cursor: 'pointer' }} />
                </div>

                <Text type="secondary" style={{ fontSize: 14 }}>
                  {item.phonetic}
                </Text>

                <div style={{ marginTop: 10 }}>
                  <Tag color={getPosColor(item.part_of_speech)}>{item.part_of_speech}</Tag>
                  <Text style={{ fontSize: 15 }}>{item.meaning}</Text>
                </div>

                <Paragraph
                  type="secondary"
                  italic
                  style={{ marginTop: 12, fontSize: 13, background: '#f5f5f5', padding: '8px 12px', borderRadius: 6 }}
                >
                  "{item.example_sentence}"
                </Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* 分页占位（后续集成分页组件） */}
      {words.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Text type="secondary">点击卡片查看 AI 记忆口诀</Text>
        </div>
      )}
    </div>
  );
}
