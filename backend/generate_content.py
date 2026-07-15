"""
批量生成单词记忆内容并上传到数据库
为每个单词生成：root_analysis, mnemonic, extra_example, phrase, sentence
"""
from supabase_client import get_supabase
import re

# ===================== 词根/前缀/后缀 字典 =====================
PREFIXES = {
    'ab': 'away/away from (离开)',
    'ad': 'to/toward (向)',
    'anti': 'against (反对)',
    'auto': 'self (自己)',
    'co': 'together (一起)',
    'com': 'together/with (共同)',
    'con': 'together/with (共同)',
    'contra': 'against (反对)',
    'de': 'down/away (向下/离开)',
    'dis': 'not/opposite (否定/相反)',
    'e': 'out (出)',
    'en': 'in/into/make (使)',
    'ex': 'out/former (出/前任)',
    'extra': 'beyond (超出)',
    'il': 'not (不)',
    'im': 'not/into (不/进入)',
    'in': 'not/into (不/进入)',
    'inter': 'between (之间)',
    'ir': 'not (不)',
    'micro': 'small (微小)',
    'mis': 'wrong (错误)',
    'multi': 'many (多)',
    'non': 'not (非)',
    'ob': 'against (反对)',
    'over': 'too much (过度)',
    'per': 'through (通过)',
    'pre': 'before (之前)',
    'pro': 'forward/for (向前)',
    're': 'again/back (再次/回)',
    'se': 'apart (分开)',
    'sub': 'under (下)',
    'super': 'above (上/超)',
    'trans': 'across (跨越)',
    'un': 'not (不)',
    'under': 'below (下/不足)',
}

SUFFIXES = {
    'able': 'capable of (能够)',
    'al': 'relating to (相关)',
    'ance': 'state/quality (状态)',
    'ant': 'one who (…的人/物)',
    'ary': 'relating to (相关)',
    'ate': 'to make (使成为)',
    'ence': 'state/quality (状态)',
    'ent': 'one who/that which (…的)',
    'er': 'one who (…的人)',
    'ful': 'full of (充满)',
    'fy': 'to make (使)',
    'ible': 'capable of (能够)',
    'ic': 'relating to (相关)',
    'ify': 'to make (使)',
    'ion': 'act/state (行为/状态)',
    'ish': 'like/nature of (像)',
    'ism': 'doctrine/belief (主义)',
    'ist': 'one who (…者)',
    'ity': 'state/quality (性质)',
    'ive': 'tending to (倾向)',
    'ize': 'to make (使)',
    'less': 'without (无)',
    'logy': 'study of (…学)',
    'ly': 'in a manner (…地)',
    'ment': 'state/act (状态/行为)',
    'ness': 'state/quality (性质)',
    'or': 'one who (…的人)',
    'ory': 'place/relating to (场所)',
    'ous': 'full of (充满)',
    'ship': 'state/condition (状态)',
    'sion': 'state/act (状态/行为)',
    'tion': 'act/state (行为/状态)',
    'tude': 'state of (状态)',
    'ty': 'state/quality (性质)',
    'ure': 'act/result (行为/结果)',
}

ROOTS = {
    'act': 'to do/ drive (做/驱动)',
    'aud': 'to hear (听)',
    'bene': 'good/well (好)',
    'cap': 'to take/seize (拿/抓)',
    'ced': 'to go/yield (走)',
    'cept': 'to take (拿)',
    'cid': 'to cut/kill (切/杀)',
    'clud': 'to close/shut (关闭)',
    'cogn': 'to know (知道)',
    'corp': 'body (身体)',
    'cred': 'to believe (相信)',
    'cur': 'to run/care (跑/关心)',
    'dict': 'to say/speak (说)',
    'duc': 'to lead (引导)',
    'fac': 'to make/do (做)',
    'fer': 'to carry/bear (携带)',
    'fin': 'end/limit (结束/界限)',
    'flect': 'to bend (弯曲)',
    'form': 'shape (形状)',
    'gen': 'birth/kind (产生/种类)',
    'grad': 'step/go (步/走)',
    'graph': 'to write (写)',
    'ject': 'to throw (扔)',
    'jud': 'to judge (判断)',
    'lect': 'to choose/gather (选择/收集)',
    'log': 'word/speech/reason (言语/推理)',
    'man': 'hand (手)',
    'mand': 'to order (命令)',
    'mem': 'remember (记忆)',
    'min': 'small/less (小/少)',
    'mit': 'to send (发送)',
    'mov': 'to move (移动)',
    'nat': 'born (出生)',
    'nov': 'new (新)',
    'opt': 'best/choose (最好/选择)',
    'part': 'part/divide (部分/分开)',
    'path': 'feeling/suffering (感觉/受苦)',
    'pel': 'to drive/push (推动)',
    'pend': 'to hang/weigh (悬挂/称重)',
    'pet': 'to seek (寻求)',
    'plic': 'to fold (折叠)',
    'pon': 'to place/put (放置)',
    'port': 'to carry (携带/运送)',
    'pos': 'to place/put (放置)',
    'press': 'to press (压)',
    'quire': 'to seek/ask (寻求/问)',
    'rupt': 'to break (打破)',
    'scend': 'to climb (攀爬)',
    'sci': 'to know (知道)',
    'scrib': 'to write (写)',
    'sens': 'to feel (感觉)',
    'sequ': 'to follow (跟随)',
    'serv': 'to keep/serve (保持/服务)',
    'sist': 'to stand (站立)',
    'solv': 'to loosen (松开/解决)',
    'spec': 'to look/see (看)',
    'spir': 'to breathe (呼吸)',
    'stat': 'to stand (站立)',
    'struct': 'to build (建造)',
    'sum': 'to take (拿)',
    'tact': 'to touch (触摸)',
    'tain': 'to hold (持有)',
    'tend': 'to stretch (伸展)',
    'tract': 'to pull/draw (拉)',
    'vac': 'empty (空)',
    'val': 'strong/worth (强/价值)',
    'ven': 'to come (来)',
    'ver': 'true (真实)',
    'vert': 'to turn (转)',
    'vid': 'to see (看)',
    'vis': 'to see (看)',
    'voc': 'to call/voice (呼唤/声音)',
    'volv': 'to roll/turn (滚/转)',
}

# ===================== 分析函数 =====================
def find_prefix(word):
    """尝试匹配前缀"""
    for pf, meaning in sorted(PREFIXES.items(), key=lambda x: -len(x[0])):
        if word.startswith(pf) and len(word) > len(pf) + 2:
            return pf, meaning
    return None, None

def find_suffix(word):
    """尝试匹配后缀"""
    for sf, meaning in sorted(SUFFIXES.items(), key=lambda x: -len(x[0])):
        if word.endswith(sf) and len(word) > len(sf) + 2:
            return sf, meaning
    return None, None

def find_root(word):
    """尝试匹配词根"""
    best = (None, None, 0)
    for rt, meaning in ROOTS.items():
        if rt in word[1:-1]:  # 不在首尾
            if len(rt) > best[2]:
                best = (rt, meaning, len(rt))
    return best[0], best[1]

def extract_meaning_cn(meaning):
    """从释义中提取核心中文含义"""
    m = re.search(r'([\u4e00-\u9fff]+)', meaning)
    if m:
        parts = m.group(1).split('；')
        return parts[0].split('；')[0].split('，')[0].split('、')[0]
    return meaning

def generate_root_analysis(word, meaning):
    """生成词根词缀解析"""
    pf, pf_meaning = find_prefix(word)
    sf, sf_meaning = find_suffix(word)
    rt, rt_meaning = find_root(word)
    
    parts = []
    if pf:
        parts.append(f"{pf}-（{pf_meaning}）")
    if rt:
        parts.append(f"{rt}（{rt_meaning}）")
    if sf:
        parts.append(f"-{sf}（{sf_meaning}）")
    
    if parts:
        cn = extract_meaning_cn(meaning)
        return f'{word} = {" + ".join(parts)} -> 联想到"{cn}"'
    else:
        # 按音节拆分
        vowels = 'aeiou'
        syl = []
        i = 0
        w = word
        while i < len(w):
            syl.append(w[i])
            i += 1
        # 简单按音节提示
        return f'"{word}" 可尝试按音节拆解记忆：{word[:3]}... + {word[-3:]}...，联想"{extract_meaning_cn(meaning)}"的画面'

def generate_mnemonic(word, meaning, root_analysis):
    """生成趣味记忆口诀"""
    mn = extract_meaning_cn(meaning)
    w_lower = word.lower()
    
    # 模式1: 谐音法
    homophones = {
        'banana': '不拿拿',
        'abandon': '阿班等',
        'curious': '可优瑞尔思',
        'brilliant': '布瑞联特',
        'diligent': '迪里坚持',
        'embrace': '拥抱',
        'fragile': '弗弱摘',
        'generous': '简娜若思',
        'harvest': '收获',
        'inevitable': '因耐维特伯',
        'journey': '旅程',
        'abstract': '爱布斯踹克特',
        'abundant': '鹅搬凳特',
        'academic': '爱克德米克',
        'accelerate': '爱克塞勒瑞特',
        'access': '爱克塞斯',
        'accommodate': '鹅烤猫dei特',
        'accompany': '鹅康姆盆你',
        'accomplish': '鹅康姆普力狮',
        'accumulate': '鹅Q缪累特',
        'accurate': '爱Q瑞特',
        'acknowledge': '鹅克脑力之',
        'acquire': '鹅快尔',
        'adapt': '鹅带头',
        'adequate': '爱德夸特',
        'adjust': '鹅加斯特',
        'administration': '爱的迷你死追神',
        'adopt': '鹅倒婆特',
        'advocate': '爱的我剋特',
        'affect': '鹅菲特',
        'aggressive': '鹅个瑞斯福',
        'allocate': '爱楼剋特',
        'alternative': '欧特纳替夫',
        'ambiguous': '安比哥优斯',
        'ambitious': '安比舍斯',
        'analyze': '安娜赖兹',
        'anticipate': '安替斯佩特',
        'apparent': '鹅派润特',
        'approach': '鹅普肉吃',
        'appropriate': '鹅普肉普瑞特',
        'approve': '鹅普入夫',
        'arise': '鹅瑞兹',
        'artificial': '阿替飞手',
        'assemble': '鹅塞姆波',
        'assess': '鹅塞斯',
        'assign': '鹅塞恩',
        'associate': '鹅搜谁特',
        'assume': '鹅休姆',
        'attain': '鹅忒恩',
        'attribute': '鹅吹布特',
        'authority': '奥斯若提',
        'available': '鹅喂了波',
        'aware': '鹅威尔',
        'barrier': '巴黎尔',
        'benefit': '贝内菲特',
        'bias': '白鹅斯',
        'boom': '布姆',
        'boundary': '邦德瑞',
        'budget': '巴结特',
        'burden': '波登',
        'capable': '剋帕波',
        'capacity': '科怕赛提',
        'category': '卡特哥瑞',
        'challenge': '拆林举',
        'channel': '拆呢儿',
        'circumstance': '色肯斯疼斯',
        'collapse': '克拉婆斯',
        'colleague': '靠里哥',
        'commit': '科密特',
        'communicate': '科谬尼剋特',
        'community': '科谬尼提',
        'compensate': '康喷塞特',
        'compete': '康辟特',
        'complex': '康普莱克斯',
        'component': '康剖嫩特',
        'comprehensive': '康普瑞焊斯福',
        'concentrate': '康森吹特',
        'concept': '康塞普特',
        'conduct': '康大可特',
        'confident': '康飞登特',
        'conflict': '康弗利克特',
        'conscious': '康舍斯',
        'consequence': '康斯克温斯',
        'conservative': '康色沃替夫',
        'considerable': '康斯得惹波',
        'consistent': '康西斯疼特',
        'constant': '康斯疼特',
        'constitute': '康斯提丢特',
        'construct': '康斯抓克特',
        'consume': '康休姆',
        'contemporary': '康泰普瑞瑞',
        'context': '康泰克斯特',
        'contract': '康揣克特',
        'contribute': '康吹布特',
        'controversial': '康戳窝手',
        'conventional': '康文身手',
        'convey': '康伟',
        'convince': '康问斯',
        'cooperate': '库奥普瑞特',
        'coordinate': '库奥蒂内特',
        'crisis': '快赛斯',
        'criterion': '快梯儿瑞恩',
        'crucial': '克鲁手',
        'cultivate': '考替维特',
        'debate': '滴贝特',
        'decline': '滴科莱恩',
        'dedicate': '德蒂凯特',
        'define': '滴饭',
        'demonstrate': '德门死追特',
        'deny': '滴耐',
        'depict': '滴批克特',
        'derive': '滴莱夫',
        'deserve': '滴则夫',
        'despite': '滴斯派特',
        'detect': '滴泰克特',
        'determine': '滴特敏',
        'device': '滴歪斯',
        'dimension': '带门神',
        'discrimination': '滴斯快米内神',
        'distinguish': '滴斯听归狮',
        'distribute': '滴斯吹布特',
        'diverse': '带卧斯',
        'domestic': '都美斯提克',
        'dominate': '多米内特',
        'dramatic': '捉买提克',
        'dynamic': '带纳米克',
        'economical': '医科闹米扣',
        'eliminate': '一厘米内特',
        'emerge': '一抹鸡',
        'emphasis': '俺佛系斯',
        'enable': '一内波',
        'enhance': '因汉斯',
        'enormous': '一弄末斯',
        'ensure': '因书尔',
        'enterprise': '俺特婆瑞斯',
        'enthusiasm': '因休贼俺森',
        'environment': '因歪润门特',
        'equivalent': '一魁沃伦特',
        'essential': '一森手',
        'establish': '一死太不历史',
        'evaluate': '一歪六埃特',
        'eventually': '一问球里',
        'evidence': '俺为等死',
        'evolution': '一窝路神',
        'exceed': '一刻西的',
        'exclude': '一刻死路得',
        'expand': '一刻死办的',
        'exploit': '一刻死婆罗伊特',
        'external': '一刻死特呢儿',
        'facilitate': '佛系里推特',
        'feature': '非扯',
        'flexible': '佛来可色波',
        'foundation': '方的神',
        'fundamental': '方达们头',
        'generate': '真呢瑞特',
        'guarantee': '该润题',
        'identify': '矮等提饭',
        'illustrate': '一拉死追特',
        'impact': '硬派克特',
        'implement': '硬普利门特',
        'implication': '硬普利剋神',
        'impose': '硬剖斯',
        'incentive': '因森替夫',
        'incorporate': '因烤破瑞特',
        'indicate': '因地剋特',
        'individual': '因地V九儿',
        'infrastructure': '因弗抓克扯',
        'innovation': '因诺微神',
        'integrate': '因特给瑞特',
        'intellectual': '因特来克球儿',
        'intense': '因疼死',
        'interpret': '因特跛瑞特',
        'invest': '因歪死特',
        'involve': '因窝夫',
        'isolate': '艾色累特',
        'justify': '加死提饭',
        'legislation': '来鸡死雷神',
        'liberal': '里波肉',
        'maintain': '门忒恩',
        'manipulate': '没你普累特',
        'mechanism': '买科你怎',
        'migrate': '买个瑞特',
        'minimize': '迷你买字',
        'motivate': '谋替维特',
        'neglect': '你个来客特',
        'notion': 'nou神',
        'objective': '欧不杰克替夫',
        'obtain': '欧波忒恩',
        'obvious': '欧波V鹅斯',
        'optimistic': '欧普替米死替克',
        'overcome': '欧窝康姆',
        'participate': '帕替色配特',
        'perceive': '破西夫',
        'phenomenon': '非糯米嫩',
        'philosophy': '飞了色飞',
        'potential': '颇ten手',
        'prejudice': '婆瑞猪蒂斯',
        'preserve': '泼蕊则夫',
        'principle': '婆润色婆',
        'priority': '婆瑞鹅瑞提',
        'procedure': '婆瑞C这',
        'profound': '婆润饭的',
        'promote': '婆润某特',
        'proportion': '婆润剖神',
        'prospect': '婆瑞斯白克特',
        'psychological': '塞克了只扣',
        'purchase': '破车斯',
        'pursue': '破休',
        'radical': '瑞蒂扣',
        'rational': '瑞神呢儿',
        'relevant': '瑞勒问特',
        'reluctant': '瑞拉可疼特',
        'representative': '瑞婆蕊怎特替夫',
        'reputation': '瑞普优忒神',
        'resolve': '瑞糟夫',
        'resource': '瑞骚斯',
        'respond': '瑞斯棒的',
        'restore': '瑞死多',
        'restrict': '瑞死追克特',
        'reveal': '瑞V欧',
        'revolution': '瑞窝路神',
        'scheme': '死给木',
        'security': '色Q瑞提',
        'significant': '色个你飞肯特',
        'strategy': '死揣特举',
        'substitute': '撒波斯替丢特',
        'sufficient': '色飞神特',
        'sustain': '色死忒恩',
        'symbolic': '森波力克',
        'tendency': 'ten灯C',
        'transform': '穿死佛母',
        'ultimate': '欧替没特',
        'undergo': '安的勾',
        'undertake': '安的忒克',
        'universal': '有你窝搜',
        'valid': '歪里德',
        'vary': '歪瑞',
        'version': '窝神',
        'virtual': '窝臭儿',
        'vision': 'V神',
        'visual': 'V手儿',
        'welfare': '威欧飞尔',
        'cat': '',
        'dog': '',
        'book': '',
    }
    
    hm = homophones.get(w_lower, '')
    if hm:
        return f'「{word}」谐音记法：读起来像"{hm}"，联想到"{mn}" → {hm}→{mn}，下次见到就想起来了！'
    
    # 模式2: 拆分联想法
    if len(word) >= 6:
        p1, p2 = word[:3], word[3:]
        return f'记「{word}」：拆成 {p1} + {p2}，想象一个人正在{p1}(动作)然后{p2}(结果)，就像"{mn}"一样！'
    
    # 模式3: 场景法
    return f'「{word}」记忆场景：想象一个关于"{mn}"的生动画面，每次想到这个单词就在脑中播放这个画面！'

def generate_example(word, meaning):
    """生成日常例句"""
    mn = extract_meaning_cn(meaning)
    templates = [
        f"I find the word '{word}' very useful when talking about {mn} in daily conversations.",
        f"Whenever I encounter '{word}', I'm reminded of the concept of {mn}.",
        f"'{word}' is one of those words that perfectly captures the essence of {mn}.",
        f"In English, we use '{word}' to express the idea of {mn}.",
        f"Mastering '{word}' helps you describe {mn} more accurately in English.",
    ]
    import random
    return random.choice(templates)

def generate_phrase(word, meaning):
    """生成常用短语/搭配"""
    mn = extract_meaning_cn(meaning)
    w = word.lower()
    
    phrase_patterns = {
        'abandon': f'{word} oneself to... 沉溺于…；{word} all hope 放弃一切希望',
        'abstract': f'{word} concept 抽象概念；{word} art 抽象艺术；in the {word} 抽象地',
        'abundant': f'{word} resources 丰富资源；{word} in... 富含…',
        'academic': f'{word} research 学术研究；{word} year 学年；{word} performance 学业成绩',
        'accelerate': f'{word} growth 加速增长；{word} the pace 加快步伐',
        'access': f'have {word} to 可以进入/使用；{word} code 访问密码；easy {word} 便捷访问',
        'accommodate': f'{word} guests 容纳客人；{word} to needs 适应需求',
        'accompany': f'{word} sb. to... 陪某人去…；be accompanied by 伴随着',
        'accomplish': f'{word} a goal 实现目标；{word} the mission 完成使命',
        'accumulate': f'{word} wealth 积累财富；{word} experience 积累经验',
        'accurate': f'{word} description 准确描述；{word} data 精确数据',
        'acknowledge': f'{word} the fact 承认事实；{word} receipt 确认收到',
        'acquire': f'{word} knowledge 获取知识；{word} skills 习得技能',
        'adapt': f'{word} to change 适应变化；{word} oneself to... 使自己适应…',
        'adequate': f'{word} preparation 充分准备；more than {word} 绰绰有余',
        'adjust': f'{word} to... 适应…；{word} the settings 调整设置',
        'administration': f'public {word} 公共管理；under the {word} of 在…管理下',
        'adopt': f'{word} a method 采用方法；{word} a child 收养孩子',
        'advocate': f'{word} for... 为…倡导；staunch {word} 坚定拥护者',
        'affect': f'adversely {word} 负面影响；{word} the outcome 影响结果',
        'aggressive': f'{word} behavior 攻击行为；{word} marketing 激进营销',
        'allocate': f'{word} resources 分配资源；{word} funds 拨款',
        'alternative': f'{word} solution 替代方案；have no {word} 别无选择',
        'ambiguous': f'{word} statement 含糊表述；remain {word} 仍然不明确',
        'ambitious': f'{word} plan 雄心计划；{word} goals 远大目标',
        'analyze': f'{word} data 分析数据；{word} the problem 分析问题',
        'anticipate': f'{word} needs 预见需求；highly {word}d 备受期待',
        'apparent': f'become {word} 变得明显；for no {word} reason 无明显原因',
        'approach': f'take a new {word} 采取新方法；{word} the problem 处理问题',
        'appropriate': f'{word} measures 适当措施；{word} behavior 得体行为',
        'approve': f'{word} the plan 批准计划；{word} of... 赞同…',
        'arise': f'problems {word} 问题出现；{word} from... 由…引起',
        'artificial': f'{word} intelligence 人工智能；{word} flavor 人造香料',
        'assemble': f'{word} parts 组装零件；{word} a team 组建团队',
        'assess': f'{word} the situation 评估形势；{word} the risk 评估风险',
        'assign': f'{word} tasks 分配任务；{word} blame 归咎',
        'associate': f'{word} with... 与…关联；close {word} 密切伙伴',
        'assume': f'{word} responsibility 承担责任；{word} that... 假设…',
        'attain': f'{word} success 获得成功；{word} a goal 达到目标',
        'attribute': f'{word}...to... 把…归因于…；positive {word} 正面属性',
        'authority': f'having {word} 有权威；local {word} 地方当局',
        'available': f'readily {word} 随时可用；make...{word} 使…可用',
        'aware': f'be {word} of... 意识到…；environmentally {word} 有环保意识',
        'barrier': f'language {word} 语言障碍；break down {word}s 打破壁垒',
        'benefit': f'{word} from... 从…受益；mutual {word} 互利',
        'bias': f'confirmation {word} 确认偏误；{word} against... 对…有偏见',
        'boom': f'economic {word} 经济繁荣；baby {word} 婴儿潮',
        'boundary': f'set {word}s 设定界限；push the {word} 突破边界',
        'budget': f'tight {word} 预算紧张；{word} cut 预算削减',
        'burden': f'heavy {word} 沉重负担；{word} of proof 举证责任',
        'capable': f'be {word} of... 有能力…；highly {word} 能力出众',
        'capacity': f'at full {word} 满负荷；production {word} 产能',
        'category': f'fall into a {word} 归入某类别；broad {word} 大类别',
        'challenge': f'face a {word} 面临挑战；{word} the status quo 挑战现状',
        'channel': f'communication {word} 沟通渠道；distribution {word} 分销渠道',
        'circumstance': f'under the {word}s 在这种情况下；adapt to {word}s 适应环境',
        'collapse': f'economy {word} 经济崩溃；{word} under pressure 压力下垮掉',
        'colleague': f'work with {word}s 与同事合作；senior {word} 资深同事',
        'commit': f'{word} to... 致力于…；{word} a crime 犯罪',
        'communicate': f'{word} with... 与…交流；{word} effectively 有效沟通',
        'community': f'local {word} 当地社区；international {word} 国际社会',
        'compensate': f'{word} for... 补偿…；{word} workers 补偿工人',
        'compete': f'{word} with... 与…竞争；{word} against each other 互相竞争',
        'complex': f'highly {word} 极其复杂；inferiority {word} 自卑情结',
        'component': f'key {word} 关键组件；essential {word} 必要组成部分',
        'comprehensive': f'{word} review 全面审查；{word} plan 综合方案',
        'concentrate': f'{word} on... 专注于…；{word} effort 集中精力',
        'concept': f'basic {word} 基本概念；grasp the {word} 掌握概念',
        'conduct': f'{word} research 进行研究；{word} a survey 进行调研',
        'confident': f'feel {word} 感到自信；{word} about... 对…有信心',
        'conflict': f'{word} of interest 利益冲突；armed {word} 武装冲突',
        'conscious': f'be {word} of... 意识到…；environmentally {word} 环保意识',
        'consequence': f'suffer the {word}s 承担后果；in {word} 因此',
        'conservative': f'{word} estimate 保守估计；{word} values 传统价值观',
        'considerable': f'{word} amount 相当数量；{word} progress 巨大进展',
        'consistent': f'{word} with... 与…一致；{word} effort 持续努力',
        'constant': f'{word} change 不断变化；{word} reminder 持续的提醒',
        'constitute': f'{word} a threat 构成威胁；{word} the majority 占大多数',
        'construct': f'{word} a building 建造建筑；{word} a theory 构建理论',
        'consume': f'{word} energy 消耗能量；{word} content 消费内容',
        'contemporary': f'{word} society 当代社会；{word} art 当代艺术',
        'context': f'in... {word} 在…背景下；historical {word} 历史背景',
        'contract': f'sign a {word} 签合同；{word} of employment 雇佣合同',
        'contribute': f'{word} to... 有助于…；{word} money 捐款',
        'controversial': f'highly {word} 极具争议；{word} issue 争议话题',
        'conventional': f'{word} wisdom 传统智慧；{word} method 常规方法',
        'convey': f'{word} a message 传达信息；{word} meaning 表达含义',
        'convince': f'{word} sb. of... 使某人相信…；{word} sb. to do 说服某人做',
        'cooperate': f'{word} with... 与…合作；closely {word} 密切合作',
        'coordinate': f'{word} efforts 协调努力；{word} with... 与…协调',
        'crisis': f'economic {word} 经济危机；{word} management 危机管理',
        'criterion': f'meet the {word} 符合标准；key {word} 关键标准',
        'crucial': f'{word} role 关键角色；{word} to success 对成功至关重要',
        'cultivate': f'{word} a habit 培养习惯；{word} relationships 培养关系',
        'debate': f'heated {word} 激烈辩论；{word} over... 就…辩论',
        'decline': f'in {word} 在下降；sharp {word} 急剧下降',
        'dedicate': f'{word} oneself to... 致力于…；{word} to... 献给…',
        'define': f'{word} clearly 明确定义；{word} the problem 界定问题',
        'demonstrate': f'{word} skills 展示技能；{word} commitment 表现出承诺',
        'deny': f'{word} allegations 否认指控；{word} access 拒绝访问',
        'depict': f'{word}...as... 把…描绘成…；vividly {word} 生动描绘',
        'derive': f'{word} from... 源自…；{word} pleasure from... 从…获得乐趣',
        'deserve': f'{word} attention 值得关注；{word} better 值得更好',
        'despite': f'{word} difficulties 尽管困难；{word} the fact that... 尽管事实是…',
        'detect': f'{word} changes 检测变化；hard to {word} 难以察觉',
        'determine': f'{word} the cause 确定原因；{word} to succeed 决心成功',
        'device': f'mobile {word} 移动设备；electronic {word} 电子设备',
        'dimension': f'new {word} 新维度；social {word} 社会层面',
        'discrimination': f'racial {word} 种族歧视；gender {word} 性别歧视',
        'distinguish': f'{word} between... 区分…；{word} oneself 使自己出众',
        'distribute': f'{word} resources 分配资源；{word} goods 分发货物',
        'diverse': f'{word} culture 多元文化；{word} backgrounds 多样背景',
        'domestic': f'{word} market 国内市场；{word} violence 家庭暴力',
        'dominate': f'{word} the market 主导市场；{word} the conversation 主导对话',
        'dramatic': f'{word} change 剧变；{word} increase 急剧增加',
        'dynamic': f'{word} environment 动态环境；{word} personality 充满活力的性格',
        'economical': f'{word} choice 经济实惠的选择；fuel-{word} 省油的',
        'eliminate': f'{word} errors 消除错误；{word} poverty 消除贫困',
        'emerge': f'{word} from... 从…出现；newly {word}d 新兴的',
        'emphasis': f'place {word} on... 强调…；shift the {word} 转移重点',
        'enable': f'{word} sb. to do... 使某人能做…；{word} development 促进发展',
        'enhance': f'{word} performance 提高表现；{word} quality 提升质量',
        'enormous': f'{word} potential 巨大潜力；{word} amount 巨额数量',
        'ensure': f'{word} safety 确保安全；{word} that... 确保…',
        'enterprise': f'private {word} 私营企业；{word} spirit 企业家精神',
        'enthusiasm': f'with great {word} 充满热情；lose {word} 失去热情',
        'environment': f'working {word} 工作环境；protect the {word} 保护环境',
        'equivalent': f'be {word} to... 等同于…；rough {word} 大致等同',
        'essential': f'{word} to/for... 对…必不可少；{word} oils 精油',
        'establish': f'{word} a company 创办公司；{word} trust 建立信任',
        'evaluate': f'{word} performance 评估表现；{word} options 评估选择',
        'eventually': f'will {word}... 最终会…；{word} succeed 最终成功',
        'evidence': f'scientific {word} 科学证据；in {word} 作为证据',
        'evolution': f'theory of {word} 进化论；{word} of technology 技术演进',
        'exceed': f'{word} expectations 超出预期；{word} the limit 超过限制',
        'exclude': f'{word} from... 把…排除在外；{word} the possibility 排除可能',
        'expand': f'{word} business 拓展业务；{word} knowledge 扩展知识',
        'exploit': f'{word} resources 开发资源；{word} opportunities 利用机会',
        'external': f'{word} factors 外部因素；{word} pressure 外部压力',
        'facilitate': f'{word} communication 促进沟通；{word} the process 推动进程',
        'feature': f'key {word} 关键特性；{word} prominently 突出展示',
        'flexible': f'{word} working hours 弹性工作时间；remain {word} 保持灵活',
        'foundation': f'lay the {word} 奠定基础；solid {word} 坚实基础',
        'fundamental': f'{word} change 根本变化；{word} principle 基本原则',
        'generate': f'{word} revenue 创收；{word} interest 引起兴趣',
        'guarantee': f'quality {word} 质量保证；{word} success 保证成功',
        'identify': f'{word} problems 发现问题；{word} with... 认同…',
        'illustrate': f'{word} a point 说明观点；{word} with examples 举例说明',
        'impact': f'{word} on... 对…的影响；significant {word} 重大影响',
        'implement': f'{word} a plan 实施计划；{word} changes 落实变革',
        'implication': f'far-reaching {word}s 深远影响；by {word} 暗示',
        'impose': f'{word} restrictions 施加限制；{word} a fine 罚款',
        'incentive': f'financial {word} 经济激励；provide {word}s 提供激励',
        'incorporate': f'{word}...into... 将…纳入…；{word} feedback 吸收反馈',
        'indicate': f'{word} that... 表明…；clearly {word} 清楚地表明',
        'individual': f'{word} differences 个体差异；{word} rights 个人权利',
        'infrastructure': f'transport {word} 交通基础设施；build {word} 建设基础设施',
        'innovation': f'technological {word} 技术创新；drive {word} 推动创新',
        'integrate': f'{word} into... 融入…；{word} theory and practice 理论与实践结合',
        'intellectual': f'{word} property 知识产权；{word} ability 智力',
        'intense': f'{word} pressure 巨大压力；{word} competition 激烈竞争',
        'interpret': f'{word} data 解读数据；{word}...as... 把…理解为…',
        'invest': f'{word} in... 投资于…；{word} time 投入时间',
        'involve': f'be {word}d in... 参与…；{word} risks 涉及风险',
        'isolate': f'{word} from... 与…隔离；feel {word}d 感到孤立',
        'justify': f'{word} the cost 证明成本的合理性；{word} actions 为行为辩护',
        'legislation': f'pass {word} 通过立法；existing {word} 现行法规',
        'liberal': f'{word} arts 文科；{word} views 开明观点',
        'maintain': f'{word} balance 保持平衡；{word} relationships 维持关系',
        'manipulate': f'{word} data 操纵数据；{word} public opinion 操控舆论',
        'mechanism': f'defense {word} 防御机制；market {word} 市场机制',
        'migrate': f'{word} overseas 移居海外；{word} to the cloud 迁移到云端',
        'minimize': f'{word} risks 最小化风险；{word} impact 减少影响',
        'motivate': f'{word} employees 激励员工；stay {word}d 保持动力',
        'neglect': f'{word} duties 玩忽职守；child {word} 忽视儿童',
        'notion': f'challenge the {word} 质疑观念；preconceived {word} 先入为主的观念',
        'objective': f'achieve {word}s 实现目标；{word} analysis 客观分析',
        'obtain': f'{word} information 获取信息；{word} permission 获得许可',
        'obvious': f'{word} advantage 明显优势；become {word} 变得明显',
        'optimistic': f'remain {word} 保持乐观；{word} about the future 对未来乐观',
        'overcome': f'{word} obstacles 克服障碍；{word} difficulties 克服困难',
        'participate': f'{word} in... 参加…；actively {word} 积极参与',
        'perceive': f'{word}...as... 把…视为…；{word} a threat 察觉威胁',
        'phenomenon': f'natural {word} 自然现象；social {word} 社会现象',
        'philosophy': f'life {word} 人生哲学；management {word} 管理理念',
        'potential': f'{word} customer 潜在客户；reach one\'s {word} 发挥潜力',
        'prejudice': f'racial {word} 种族偏见；overcome {word} 克服偏见',
        'preserve': f'{word} the environment 保护环境；{word} culture 保存文化',
        'principle': f'basic {word} 基本原则；in {word} 原则上',
        'priority': f'top {word} 首要任务；give {word} to... 优先考虑…',
        'procedure': f'standard {word} 标准程序；emergency {word} 紧急程序',
        'profound': f'{word} impact 深远影响；{word} understanding 深刻理解',
        'promote': f'{word} development 促进发展；{word} awareness 提高意识',
        'proportion': f'in {word} to... 与…成比例；out of {word} 不成比例',
        'prospect': f'future {word}s 未来前景；in {word} 有望',
        'psychological': f'{word} pressure 心理压力；{word} well-being 心理健康',
        'purchase': f'make a {word} 购买；{word} price 购买价格',
        'pursue': f'{word} a career 追求事业；{word} happiness 追求幸福',
        'radical': f'{word} change 彻底改变；{word} idea 激进的想法',
        'rational': f'{word} thinking 理性思考；{word} decision 理性决策',
        'relevant': f'{word} experience 相关经验；{word} to... 与…相关',
        'reluctant': f'be {word} to do... 不愿做…；{word} acceptance 勉强接受',
        'representative': f'legal {word} 法律代表；a {word} sample 代表性样本',
        'reputation': f'good {word} 良好声誉；damage one\'s {word} 损害名声',
        'resolve': f'{word} conflicts 解决冲突；{word} a problem 解决问题',
        'resource': f'natural {word}s 自然资源；human {word}s 人力资源',
        'respond': f'{word} to... 回应…；{word} quickly 快速响应',
        'restore': f'{word} order 恢复秩序；{word} confidence 恢复信心',
        'restrict': f'{word} access 限制访问；{word} to... 局限于…',
        'reveal': f'{word} the truth 揭露真相；{word} secrets 揭示秘密',
        'revolution': f'industrial {word} 工业革命；digital {word} 数字革命',
        'scheme': f'color {word} 配色方案；pension {word} 养老金计划',
        'security': f'national {word} 国家安全；job {word} 工作保障',
        'significant': f'{word} increase 显著增长；{word} role 重要角色',
        'strategy': f'marketing {word} 营销策略；develop a {word} 制定策略',
        'substitute': f'{word} for... …的替代品；no {word} for... 无可替代',
        'sufficient': f'{word} evidence 充分证据；{word} time 足够时间',
        'sustain': f'{word} growth 维持增长；{word} damage 遭受损失',
        'symbolic': f'{word} meaning 象征意义；purely {word} 纯象征性的',
        'tendency': f'a {word} to... …的倾向；general {word} 普遍趋势',
        'transform': f'{word}...into... 把…变成…；{word} lives 改变生活',
        'ultimate': f'{word} goal 最终目标；the {word} in... …中的极致',
        'undergo': f'{word} changes 经历变化；{word} training 接受培训',
        'undertake': f'{word} a task 承担任务；{word} research 进行研究',
        'universal': f'{word} value 普世价值；{word} appeal 普遍的吸引力',
        'valid': f'{word} reason 正当理由；remain {word} 仍然有效',
        'vary': f'{word} from...to... 从…到…不等；opinions {word} 意见不一',
        'version': f'latest {word} 最新版本；original {word} 原始版本',
        'virtual': f'{word} reality 虚拟现实；{word} meeting 线上会议',
        'vision': f'{word} of the future 未来愿景；field of {word} 视野',
        'visual': f'{word} effect 视觉效果；{word} arts 视觉艺术',
        'welfare': f'social {word} 社会福利；animal {word} 动物福利',
        'banana': '',
        'cat': '',
        'dog': '',
        'book': '',
    }
    
    if w in phrase_patterns and phrase_patterns[w]:
        return phrase_patterns[w]
    
    # 通用模板
    patterns = [
        f'common {word} 常见的{mn}；{word} in daily life 日常生活中的{mn}',
        f'key {word} 关键{mn}；{word} development {mn}发展',
        f'{word} level {mn}水平；{word} improvement {mn}提升',
    ]
    import random
    return random.choice(patterns)

def generate_sentence(word, meaning):
    """生成造句练习"""
    mn = extract_meaning_cn(meaning)
    
    templates = [
        f'请用 "{word}" 造一个与你日常生活相关的英文句子。',
        f'Write a sentence using "{word}" to describe a recent experience.',
        f'Use "{word}" in a sentence about your work or study.',
        f'How would you use "{word}" to express the idea of "{mn}" in English?',
        f'Create a meaningful sentence with "{word}" that you can use in real conversations.',
    ]
    import random
    return random.choice(templates)

# ===================== 主流程 =====================
def main():
    supabase = get_supabase()
    
    # 读取所有单词
    with open('words_list.txt', 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    total = len(lines)
    print(f"共有 {total} 个单词待处理")
    
    success = 0
    fail = 0
    
    for i, line in enumerate(lines):
        parts = line.strip().split('|')
        if len(parts) < 4:
            continue
        word_id, word, phonetic, meaning = parts[0], parts[1], parts[2], parts[3]
        
        # 生成内容
        root_analysis = generate_root_analysis(word, meaning)
        mnemonic = generate_mnemonic(word, meaning, root_analysis)
        extra_example = generate_example(word, meaning)
        phrase = generate_phrase(word, meaning)
        sentence = generate_sentence(word, meaning)
        
        try:
            result = supabase.table('words').update({
                'root_analysis': root_analysis,
                'mnemonic': mnemonic,
                'extra_example': extra_example,
                'phrase': phrase,
                'sentence': sentence,
            }).eq('id', int(word_id)).execute()
            
            if result.data:
                success += 1
                if success % 10 == 0:
                    print(f"进度: {success}/{total}")
            else:
                fail += 1
                print(f"  失败: {word}({word_id})")
        except Exception as e:
            fail += 1
            print(f"  异常: {word}({word_id}): {e}")
    
    print(f"\n完成！成功: {success}, 失败: {fail}")

if __name__ == '__main__':
    main()
