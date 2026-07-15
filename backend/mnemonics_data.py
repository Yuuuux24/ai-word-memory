"""每单词三种风格记忆素材 (id -> {style: text})
将分批追加，最后由 update_mnemonics.py 统一写入数据库
"""
MNEMONICS = {

# ============================================================
# 风格说明：
#   simple   - 极简干货：词根词缀拆解，直击核心含义
#   story    - 趣味故事：把单词融入生活情境小故事
#   mnemonic - 谐音口诀：用中文谐音联想记忆
# ============================================================

# --- 1-10 ---
1: {"simple":"banana /bəˈnɑːnə/ n.香蕉。音节拆解：ba- + -nana，想象一根弯弯的香蕉，三段音节刚好对应香蕉的三段弧度。","story":"小明第一次去英国超市，想买香蕉却说不出英文，急得手舞足蹈。店员笑着递给他一把香蕉说：\"You mean banana?\" 从此小明再也没忘记这个词。","mnemonic":"「banana」谐音\"不拿拿\"，不拿白不拿 → 看到香蕉就想拿一根，轻松记住！"},
2: {"simple":"cat /kæt/ n.猫。单音节词，直接记忆。c 像猫蜷缩的背，a 像猫张开的嘴，t 像猫的尾巴。","story":"邻居家的猫每天准时蹲在我窗台上喵喵叫，我给它起了个英文名 Cat，后来发现它只是来蹭饭的。","mnemonic":"「cat」谐音\"开特\" → 猫咪推开特别的门进你家，把猫\"开特\"门记成 cat。"},
3: {"simple":"dog /dɒɡ/ n.狗。单音节词，象声词来源，模仿狗叫声\"dog-dog\"。","story":"遛狗时遇到老外夸我家狗 cute，我立马回答 \"Thanks, he's a very friendly dog!\" 一次真实的社交英语就用上了。","mnemonic":"「dog」谐音\"道格\" → 道格是一只狗的名字，想到\"道格\"就想到 dog。"},
4: {"simple":"book /bʊk/ n.书本。单音节，从古英语 bōc 演变而来。字形像两本书叠放，oo 像打开的书页。","story":"图书馆里一个小男孩抱着厚厚一摞 book，管理员笑着问他要不要帮忙。他说不用，这些书能让他变成更厉害的人。","mnemonic":"「book」谐音\"布克\" → 用布包着的课本，布克 = book = 书！"},
5: {"simple":"abstract /ˈæbstrækt/ adj.抽象的 n.摘要。词根 abs-(离开)+tract(拉)→从具体事物中拉出来→抽象的。同根词：extract(提取)，contract(合同)。","story":"艺术家办了个画展，全是 abstract 画作。观众一头雾水，艺术家解释：\"抽象就是把现实抽走，留下感觉。\" 记住 abstract = 抽出本质。","mnemonic":"「abstract」谐音\"阿布死拽课特\" → 阿布死拽着一节特别抽象的课不放，abstract = 抽象的！"},
6: {"simple":"abundant /əˈbʌndənt/ adj.丰富的。词根 ab-(离开)+und(波浪→溢出)+ant(形容词尾)→多到溢出来→丰富的。同源词：abound(充满)。","story":"丰收节上，村民们展示了 abundant 的农作物。村长笑着说：\"我们的土地从不吝啬，abundant 就是它教我们的第一个英文单词。\"","mnemonic":"「abundant」谐音\"阿邦等他\" → 阿邦有丰富的资源等他用，abundant = 丰富的！"},
7: {"simple":"academic /ˌækəˈdemɪk/ adj.学术的。源自柏拉图学院 Academia。词根 academ-(学院)+ic(形容词尾)→学院派的→学术的。","story":"教授在 academic 会议上发表了惊人的研究成果，台下掌声雷动。会后学生问他成功的秘诀，他说：\"保持 academic 的好奇心就够了。\"","mnemonic":"「academic」谐音\"爱可带米克\" → 爱可带着米克去搞学术研究，academic = 学术的！"},
8: {"simple":"accelerate /əkˈseləreɪt/ v.加速。词根 ac-(加强)+celer(快速)+ate(动词尾)→使更快→加速。同根词：decelerate(减速)。","story":"赛车手在直道上猛踩油门，赛车开始 accelerate。观众屏住呼吸，短短几秒速度就飙到 300——accelerate 就是这种推背感。","mnemonic":"「accelerate」谐音\"俄克塞了瑞特\" → 俄克塞了车加速跑向瑞特，accelerate = 加速！"},
9: {"simple":"access /ˈækses/ n.进入 v.访问。词根 ac-(朝向)+cess(走)→走过去→进入。同根词：success(成功)，excess(超过)。","story":"程序员加班到深夜，终于拿到了服务器的 access 权限。他兴奋地敲下回车键：\"I have access!\" 一瞬间所有数据展现在面前。","mnemonic":"「access」谐音\"爱可赛斯\" → 爱可比赛跑步获得了进入决赛的资格，access = 进入/访问！"},
10: {"simple":"accommodate /əˈkɒmədeɪt/ v.容纳；适应。词根 ac-(加强)+com-(共同)+mod(方式)+ate(动词尾)→用合适的方式接纳→容纳。","story":"酒店前台微笑着对客人说：\"We can accommodate up to 200 guests.\" 一场婚礼让酒店容纳了来自全国各地的亲朋好友。","mnemonic":"「accommodate」谐音\"阿卡莫得特\" → 阿卡的房子能容纳莫得特一家人，accommodate = 容纳！"},

# --- 11-20 ---
11: {"simple":"accompany /əˈkʌmpəni/ v.陪伴。词根 ac-(加强)+company(伙伴)→加强伙伴关系→陪伴。同源词：companion(同伴)。","story":"奶奶住院期间，孙子每天都来 accompany 她。奶奶说：\"你不用天天来。\"孙子握紧她的手：\"You accompany me when I was little, now it's my turn.\"","mnemonic":"「accompany」谐音\"阿卡爬你\" → 阿卡爬山也要陪你一起，accompany = 陪伴！"},
12: {"simple":"accomplish /əˈkʌmplɪʃ/ v.完成。词根 ac-(加强)+com-(全部)+pli(填满)+sh→全部填满→完成。同根词：complete(完成)。","story":"花了三个月终于 accomplish 了马拉松训练计划。冲线那一刻，他大喊：\"I accomplished it!\" 汗水与泪水让这个单词刻进了生命里。","mnemonic":"「accomplish」谐音\"阿康普利施\" → 阿康普利施工全部完成，accomplish = 完成！"},
13: {"simple":"accumulate /əˈkjuːmjəleɪt/ v.积累。词根 ac-(加强)+cumul(堆积)+ate(动词尾)→不断堆积→积累。同根词：cumulative(累积的)。","story":"小镇图书馆的老馆长用一生 accumulate 了两万册藏书。他说：\"知识就像 snowball，越 accumulate 越大。\"","mnemonic":"「accumulate」谐音\"阿Q缪雷特\" → 阿Q一点一点积累谬雷特财富，accumulate = 积累！"},
14: {"simple":"accurate /ˈækjərət/ adj.精确的。词根 ac-(加强)+cur(关心/仔细)+ate(形容词尾)→非常仔细的→精确的。同根词：curious(好奇的)。","story":"钟表匠修好了一座百年老钟，每天误差不到一秒。客人惊叹：\"So accurate!\" 老匠人微微一笑：\"Accurate is my middle name.\"","mnemonic":"「accurate」谐音\"爱可有瑞特\" → 爱可有瑞特级别的精确测量，accurate = 精确的！"},
15: {"simple":"acknowledge /əkˈnɒlɪdʒ/ v.承认；感谢。词根 ac-(加强)+knowledge(知识)→让人知道→承认。同源词：knowledge(知识)。","story":"科学家在诺贝尔奖台上 acknowledge 了所有合作者的贡献。他说：\"承认别人的帮助，比获奖本身更重要。\"","mnemonic":"「acknowledge」谐音\"阿克诺利知\" → 阿克终于诺利知道了真相并承认，acknowledge = 承认！"},
16: {"simple":"acquire /əˈkwaɪər/ v.获得；习得。词根 ac-(加强)+quire(寻求)→主动寻求→获得。同根词：require(需要)，inquire(询问)。","story":"留学生花了两年才 acquire 流利的英语口语。她说秘诀是：\"Don't be afraid to make mistakes. That's how you acquire a language.\"","mnemonic":"「acquire」谐音\"阿快儿\" → 阿快儿通过努力获得了成功，acquire = 获得！"},
17: {"simple":"adapt /əˈdæpt/ v.适应；改编。词根 ad-(朝向)+apt(适合)→使适合→适应。同根词：aptitude(天赋)。","story":"企鹅从南极搬到动物园，只用了三天就 adapt 了新环境。饲养员感叹：\"Adapt or die——这是自然界的法则，也是学习的法则。\"","mnemonic":"「adapt」谐音\"阿带普特\" → 阿带普特要适应新环境才能生存，adapt = 适应！"},
18: {"simple":"adequate /ˈædɪkwət/ adj.足够的。词根 ad-(朝向)+equ(相等)+ate(形容词尾)→与所需相等→足够的。同根词：equal(平等的)。","story":"考试前老师说：\"Adequate sleep is more important than cramming.\" 结果熬夜复习的同学全挂了，睡够八小时的全过了。","mnemonic":"「adequate」谐音\"爱迪夸特\" → 爱迪夸特说有足够的证据，adequate = 足够的！"},
19: {"simple":"adjust /əˈdʒʌst/ v.调整；适应。词根 ad-(朝向)+just(正好)→使刚好合适→调整。同根词：justice(公正)。","story":"摄影师花了半小时 adjust 三脚架的角度，终于拍到了完美的日出。他说：\"Life is all about adjust. You move a little, perspective changes completely.\"","mnemonic":"「adjust」谐音\"阿加斯特\" → 阿加斯特需要调整设备参数，adjust = 调整！"},
20: {"simple":"administration /ədˌmɪnɪˈstreɪʃn/ n.管理；行政。词根 ad-(加强)+ministr(服务)+ation(名词尾)→提供服务→管理。同根词：minister(部长)。","story":"学生会 administration 换届选举，候选人慷慨激昂地承诺改善食堂。台下有人小声说：\"Administration 不就是开会签字盖章吗？\" 全场笑翻。","mnemonic":"「administration」谐音\"阿德米尼斯吹神\" → 阿德米尼斯是管理界吹神级人物，administration = 管理！"},

# --- 21-30 ---
21: {"simple":"adopt /əˈdɒpt/ v.采用；收养。词根 ad-(朝向)+opt(选择)→选择→采用/收养。同根词：option(选项)。","story":"夫妻俩去孤儿院 adopt 了一个小女孩。回家的车上，小女孩轻声问：\"Why did you adopt me?\" 妈妈说：\"Because our hearts chose you.\"","mnemonic":"「adopt」谐音\"阿道普特\" → 阿道普特决定收养一只流浪猫，adopt = 收养/采用！"},
22: {"simple":"advocate /ˈædvəkeɪt/ v.提倡 n.拥护者。词根 ad-(加强)+voc(声音/呼喊)+ate(动词尾)→大声呼喊→提倡。同根词：vocal(发声的)。","story":"环保少女在联合国大会上 advocate 减排政策。她说：\"I'm not just an advocate. I'm your future standing here begging you to listen.\"","mnemonic":"「advocate」谐音\"爱德沃凯特\" → 爱德沃凯特大力提倡教育改革，advocate = 提倡！"},
23: {"simple":"affect /əˈfekt/ v.影响；感动。词根 af-(加强)+fect(做)→作用于→影响。区分 effect(n.效果)：affect 是动作，effect 是结果。","story":"一场暴雨 affect 了整个城市的交通。但一个小女孩在雨中给流浪猫撑伞的画面，却 affect 了无数路人的心。","mnemonic":"「affect」谐音\"阿菲特\" → 阿菲特的行为影响了整个团队，affect = 影响！"},
24: {"simple":"aggressive /əˈɡresɪv/ adj.侵略的；进取的。词根 ag-(加强)+gress(走)+ive(形容词尾)→一直往前走→侵略的/进取的。同根词：progress(进步)。","story":"新来的销售总监风格非常 aggressive，第一个月就拿下了三个大客户。老板说：\"I like aggressive people. They make things happen.\"","mnemonic":"「aggressive」谐音\"阿格瑞西夫\" → 阿格瑞西夫打篮球很有侵略性，aggressive = 侵略的/进取的！"},
25: {"simple":"allocate /ˈæləkeɪt/ v.分配。词根 al-(加强)+loc(位置)+ate(动词尾)→放到指定位置→分配。同根词：location(位置)。","story":"项目经理说：\"We need to allocate resources wisely.\" 然后他把 80% 的预算分给了自己最喜欢的项目。同事们：\"That's one way to allocate...\"","mnemonic":"「allocate」谐音\"爱了K特\" → 爱了 K 特就能优先分配资源，allocate = 分配！"},
26: {"simple":"alternative /ɔːlˈtɜːnətɪv/ n.替代方案 adj.替代的。词根 altern-(交替)+ative(形容词尾)→交替的→替代的。同根词：alternate(交替)。","story":"航班取消了，地勤微笑着说：\"We have an alternative flight for you.\" 结果这个 alternative 比原航班还早到一小时——有时候替代方案反而更好。","mnemonic":"「alternative」谐音\"奥特那提夫\" → 奥特曼那提夫是替代方案之王，alternative = 替代方案！"},
27: {"simple":"ambiguous /æmˈbɪɡjuəs/ adj.模棱两可的。词根 ambi-(两个/两边)+igu(驱动)+ous→往两边驱动的→不确定的→含糊的。同根词：ambition(野心)。","story":"老板说\"尽快完成\"，这简直是最 ambiguous 的指示。到底是今天完成还是这周完成？ambiguous 就是这样让人抓狂的词。","mnemonic":"「ambiguous」谐音\"俺比各有斯\" → 俺比较各有各的说法所以含糊不清，ambiguous = 模棱两可的！"},
28: {"simple":"ambitious /æmˈbɪʃəs/ adj.有雄心的。词根 amb-(周围)+it(走)+ious(形容词尾)→到处走拉选票→有野心的。源自罗马政治家到处拉票的行为。","story":"实习生第一天就说要当 CEO。有人嘲笑他 too ambitious，但十年后他真的做到了。他说：\"Being ambitious is not a sin.\"","mnemonic":"「ambitious」谐音\"俺必胜\" → 俺必胜的决心就是有雄心的表现，ambitious = 有雄心的！"},
29: {"simple":"analyze /ˈænəlaɪz/ v.分析。词根 ana-(彻底)+lyze(解开)→彻底解开来→分析。同根词：analysis(n.分析)。","story":"侦探蹲在案发现场 analyze 每一处痕迹。助手问他在看什么，他说：\"Analyze everything. The truth is always in the details.\"","mnemonic":"「analyze」谐音\"安娜来字\" → 安娜来分析这些字的含义，analyze = 分析！"},
30: {"simple":"anticipate /ænˈtɪsɪpeɪt/ v.预期；抢先。词根 anti-(在前)+cip(拿)+ate(动词尾)→提前拿住→预期。同根词：participate(参与)。","story":"小明 anticipate 到了考题内容，提前复习了那几章。考试时他暗自窃喜：\"I anticipated this!\" 但最后一题他完全没 anticipate 到。","mnemonic":"「anticipate」谐音\"俺替西佩特\" → 俺替西佩特提前预期了他的行为，anticipate = 预期！"},

# --- 31-40 ---
31: {"simple":"apparent /əˈpærənt/ adj.明显的。词根 ap-(加强)+par(出现)+ent(形容词尾)→显现出来的→明显的。同根词：appear(出现)。","story":"老板说\"It's apparent that you didn't prepare.\" 他指着空白的 PPT 屏幕。确实，没准备这件事太 apparent 了，藏都藏不住。","mnemonic":"「apparent」谐音\"阿派润特\" → 阿派润特的实力很明显地展现出来，apparent = 明显的！"},
32: {"simple":"approach /əˈprəʊtʃ/ n.方法 v.接近。词根 ap-(朝向)+proach(近)→向近处走→接近。同根词：reproach(责备)。","story":"面试官问他：\"What's your approach to solving problems?\" 他想了想说：\"My approach is simple: first approach the problem, then break it down.\" 一句话用了两次 approach。","mnemonic":"「approach」谐音\"阿脯肉吃\" → 阿脯肉吃的方法就是先接近再吃掉，approach = 方法/接近！"},
33: {"simple":"appropriate /əˈprəʊpriət/ adj.适当的。词根 ap-(加强)+propri(自己的)+ate(形容词尾)→使之变成自己的→适当的。同根词：proper(合适的)。","story":"上司提醒他：\"Make sure your outfit is appropriate for the client meeting.\" 他看了看自己的花衬衫，默默换上了西装。","mnemonic":"「appropriate」谐音\"阿脯肉普瑞特\" → 阿脯肉普瑞特选了一套合适的衣服，appropriate = 适当的！"},
34: {"simple":"approve /əˈpruːv/ v.批准；赞成。词根 ap-(加强)+prove(证明)→证明可行→批准。同根词：prove(证明)。","story":"等了三周，签证终于被 approve 了！他激动地发朋友圈：\"APPROVED! 三个字母改变了我的人生轨迹。\"","mnemonic":"「approve」谐音\"阿普鲁夫\" → 阿普鲁夫批准了这项计划，approve = 批准/赞成！"},
35: {"simple":"arise /əˈraɪz/ v.出现；产生。词根 a-(向上)+rise(升起)→从低处升起→出现。注意过去式 arose，过去分词 arisen。","story":"每当问题 arise，老工程师总是不慌不忙。徒弟问他秘诀，他说：\"Problems arise every day. Panic never helps.\"","mnemonic":"「arise」谐音\"阿莱子\" → 阿莱子的问题突然出现了，arise = 出现！"},
36: {"simple":"artificial /ˌɑːtɪˈfɪʃl/ adj.人工的。词根 art-(技艺)+fic(做)+ial(形容词尾)→用技艺做出来的→人工的。同根词：artificial intelligence(AI)。","story":"现在 artificial intelligence 能写诗、画画、做音乐。朋友感叹：\"Is anything still real?\" 他说：\"The emotion behind using AI is still real.\"","mnemonic":"「artificial」谐音\"阿替飞手\" → 阿替飞手用的是人工制造的义肢，artificial = 人工的！"},
37: {"simple":"assemble /əˈsembl/ v.集合；组装。词根 as-(加强)+semble(一起)→使到一起→集合/组装。同根词：resemble(相似)。","story":"全家人 assemble 在一起组装宜家书柜。爸爸看说明书，妈妈递零件，儿子拧螺丝。三个小时后，书柜终于 assembled 了——虽然多出来两颗螺丝。","mnemonic":"「assemble」谐音\"阿森波\" → 阿森波号召大家集合到广场，assemble = 集合/组装！"},
38: {"simple":"assess /əˈses/ v.评估。词根 as-(朝向)+sess(坐)→坐下来仔细看→评估。同根词：session(会议)。","story":"房屋评估师来 assess 房子的价值。他在屋里走了一圈，在本子上写写画画。一个小时后给出了一个数字，房东差点晕过去。","mnemonic":"「assess」谐音\"阿赛斯\" → 阿赛斯正在评估比赛选手的实力，assess = 评估！"},
39: {"simple":"assign /əˈsaɪn/ v.分配；指派。词根 as-(加强)+sign(标记)→做标记分配→指派。同根词：sign(签名)，design(设计)。","story":"老板 assign 了一个紧急任务给他，deadline 是明天早上。他叹了口气说：\"Assign away, I'll get it done.\" 连夜加班。","mnemonic":"「assign」谐音\"阿赛恩\" → 阿赛恩被分配到了一项秘密任务，assign = 分配！"},
40: {"simple":"associate /əˈsəʊʃieɪt/ v.联系 n.伙伴。词根 as-(加强)+soci(同伴)+ate(动词尾)→与同伴在一起→联系/关联。同根词：social(社会的)。","story":"很多人 associate 夏天和西瓜，冬天和火锅。他说：\"I associate every English word with a life moment. That's my secret to memory.\"","mnemonic":"「associate」谐音\"阿收西特\" → 阿收西特总是把不同事物联系起来，associate = 联系！"},

# --- 41-50 ---
41: {"simple":"assume /əˈsjuːm/ v.假设；承担。词根 as-(加强)+sume(拿)→拿过来→承担/假设。同根词：consume(消费)，resume(恢复)。","story":"老师问：\"Never assume, because what does assume make?\" 全班齐声回答：\"An ASS out of U and ME!\" 全班笑着记住了这个梗。","mnemonic":"「assume」谐音\"阿休姆\" → 阿休姆假设自己能承担这个重任，assume = 假设/承担！"},
42: {"simple":"attain /əˈteɪn/ v.达到；获得。词根 at-(加强)+tain(持/握)→握住→获得。同根词：contain(包含)，maintain(维持)。","story":"他花了五年才 attain 博士学位的目标。毕业典礼上导师说：\"You didn't just attain a degree. You attained the ability to never give up.\"","mnemonic":"「attain」谐音\"阿泰恩\" → 阿泰恩终于达到了事业的巅峰，attain = 达到/获得！"},
43: {"simple":"attribute /əˈtrɪbjuːt/ n.属性 v.归因于。词根 at-(加强)+tribute(分配)→分配给的→归因于。同根词：contribute(贡献)。","story":"成功人士常把自己 attribute 努力，失败者 attribute 运气。其实 attribute 这个词本身就是最好的答案——你往哪里 attribute，人生就往哪里去。","mnemonic":"「attribute」谐音\"阿吹不特\" → 阿吹不特特别喜欢把功绩归因于团队，attribute = 归因于！"},
44: {"simple":"authority /ɔːˈθɒrəti/ n.权威；当局。词根 author-(作者/创造者)+ity(名词尾)→创始者的权力→权威。同根词：author(作者)。","story":"小学生挑战校长的 authority：\"为什么不能带手机？\" 校长反问：\"Because I'm the authority, and sometimes authority needs no explanation.\"","mnemonic":"「authority」谐音\"奥索瑞提\" → 奥索瑞提是这一领域的绝对权威，authority = 权威！"},
45: {"simple":"available /əˈveɪləbl/ adj.可用的；有空的。词根 a-(加强)+vail(价值)+able(能…的)→有价值可用的→可用的。同根词：value(价值)。","story":"他看了看日程表说：\"I'm available this Friday.\" 朋友惊呆了，因为这人号称全年无休。\"Available\" 从他嘴里说出来比钻石还稀有。","mnemonic":"「available」谐音\"阿维勒波\" → 阿维勒波有空来参加聚会了，available = 可用的/有空的！"},
46: {"simple":"aware /əˈweər/ adj.意识到的。词根 a-(在…状态)+ware(小心/警觉)→保持警觉的→意识到的。同根词：beware(当心)。","story":"过马路时妈妈提醒孩子：\"Be aware of the traffic!\" 孩子反问：\"Are you aware that you worry too much?\" 妈妈竟无言以对。","mnemonic":"「aware」谐音\"阿薇儿\" → 阿薇儿意识到了自己的错误，aware = 意识到的！"},
47: {"simple":"barrier /ˈbæriər/ n.障碍；屏障。词根 barr-(栏杆/障碍)+ier(名词尾)→障碍物。同根词：bar(吧台/栏杆)。","story":"语言 barrier 是他出国最大的困扰。点餐时把 chicken 说成 kitchen，服务员端来一个碗。但他笑着说：\"Every barrier is just a bridge waiting to be crossed.\"","mnemonic":"「barrier」谐音\"百瑞儿\" → 百瑞儿面前有一道无法逾越的障碍，barrier = 障碍！"},
48: {"simple":"benefit /ˈbenɪfɪt/ n.利益 v.有益于。词根 bene-(好)+fit(做)→做好事→有益于。同根词：benevolent(仁慈的)。","story":"老板说学英语 benefit 职业发展。员工问：\"What's the benefit package?\" 老板沉默。有时候 benefit 这个词需要双向的理解。","mnemonic":"「benefit」谐音\"本你飞特\" → 本来你飞黄腾达就是件有利可图的事，benefit = 利益/有益于！"},
49: {"simple":"bias /ˈbaɪəs/ n.偏见。源自法语 biais(倾斜)。无意识 bias 是心理学重要概念。同义词：prejudice(偏见)。","story":"面试官承认自己有 unconscious bias，总是更偏爱同校毕业的候选人。意识到 bias 之后，他开始用匿名简历筛选。","mnemonic":"「bias」谐音\"百阿司\" → 百阿司机对乘客有偏见，bias = 偏见！"},
50: {"simple":"boom /buːm/ n.繁荣 v.激增。拟声词，模仿爆炸声\"嘣\"。形容经济或数量的爆炸式增长。同义词：prosperity(繁荣)。","story":"小镇因为发现石油经历了 economic boom，一夜间从几百人变成几万人。镇长说：\"Boom is exciting, but sustainable growth is what we really need.\"","mnemonic":"「boom」谐音\"布姆\" → 布姆项目让公司业务像爆炸一样繁荣增长，boom = 繁荣！"},

# --- 51-60 ---
51: {"simple":"boundary /ˈbaʊndri/ n.边界。词根 bound-(界限)+ary(名词尾)→边界线。同根词：bound(束缚)。","story":"两个国家的边界线上有一条小河，当地孩子在河里游泳，根本不管 boundary。对他们来说，boundary 只是地图上的一条线。","mnemonic":"「boundary」谐音\"棒得瑞\" → 棒得瑞这条国界线划分得特别清楚，boundary = 边界！"},
52: {"simple":"budget /ˈbʌdʒɪt/ n.预算。源自法语 bougette(皮钱包)。政府/公司每年都要做 budget planning。","story":"财务总监说：\"We're over budget.\" 全部门鸦雀无声。然后实习生小声问：\"What is budget?\" 总监扶额：\"It's the thing we never have enough of.\"","mnemonic":"「budget」谐音\"巴结特\" → 巴结特意去争取更多预算额度，budget = 预算！"},
53: {"simple":"burden /ˈbɜːdn/ n.负担 v.加重担。词根 burd-(搬运)+en→搬运重物→负担。同义词：load(负荷)。","story":"他觉得照顾生病的父亲不是 burden，而是责任。\"Burden is just love with heavy lifting,\" 他在日记里写道。","mnemonic":"「burden」谐音\"伯登\" → 伯登肩负着沉重的家庭负担，burden = 负担！"},
54: {"simple":"capable /ˈkeɪpəbl/ adj.有能力的。词根 cap-(拿)+able(能…的)→能拿住的→有能力的。同根词：capacity(容量)，capture(捕获)。","story":"老板问他能不能接手这个项目，他说：\"I'm more than capable.\" 结果项目做得比预期还好，老板从此逢人就夸他 capable。","mnemonic":"「capable」谐音\"K佩波\" → K佩波是个非常有能力的高手，capable = 有能力的！"},
55: {"simple":"capacity /kəˈpæsəti/ n.能力；容量。词根 cap-(拿)+acity(名词尾)→能拿住的能力→容量/能力。同根词：capable(有能力的)。","story":"这场演唱会的 capacity 是一万人，结果来了两万。保安喊：\"Over capacity!\" 但歌迷根本不在乎 capacity，只要能听到歌声。","mnemonic":"「capacity」谐音\"卡佩斯提\" → 卡佩斯提的容量足够容纳所有人，capacity = 容量/能力！"},
56: {"simple":"category /ˈkætəɡəri/ n.类别。词根 cat-(向下)+egory(集合)→分类整理的集合→类别。同根词：catalogue(目录)。","story":"图书馆员花了三天把所有书按 category 重新排列。有个读者问科幻在哪，她说：\"Science Fiction category, Aisle 7.\" 那一刻她觉得自己的 category 划分简直完美。","mnemonic":"「category」谐音\"开特格里\" → 把这些商品开特格里分成不同类别，category = 类别！"},
57: {"simple":"challenge /ˈtʃælɪndʒ/ n.挑战 v.质疑。源自拉丁语 calumnia(诬告)。现代含义更多是正面挑战。","story":"教练说：\"This training is a challenge. If you can't handle it, leave now.\" 所有人都留下了。因为真正的 challenge 不是放弃，而是坚持。","mnemonic":"「challenge」谐音\"柴伦治\" → 柴伦接受挑战去治理洪水，challenge = 挑战！"},
58: {"simple":"channel /ˈtʃænl/ n.频道；渠道；海峡。源自拉丁语 canalis(管道)。信息 channel 是沟通的生命线。","story":"他换了无数个 channel 都没找到想看的节目。室友说：\"Maybe the best channel is not on TV.\" 然后拉他去散步了。","mnemonic":"「channel」谐音\"柴诺\" → 柴诺有多个渠道传播消息，channel = 频道/渠道！"},
59: {"simple":"circumstance /ˈsɜːkəmstəns/ n.环境；情况。词根 circum-(周围)+stance(站立)→周围站立的东西→环境。同根词：circle(圆形)。","story":"面试官问：\"How do you handle difficult circumstances?\" 他想了想说：\"I don't let circumstance define me. I define how I respond to circumstance.\"","mnemonic":"「circumstance」谐音\"色肯斯登斯\" → 在任何环境色肯斯登斯都要站稳脚跟，circumstance = 环境！"},
60: {"simple":"collapse /kəˈlæps/ v.倒塌 n.崩溃。词根 col-(一起)+lapse(滑落)→一起滑落→倒塌。同根词：elapse(流逝)。","story":"地震中那座百年古塔 collapse 了。村民哭着在废墟前站了很久。一年后他们在原址建了一座更坚固的塔——collapse 之后，是重建。","mnemonic":"「collapse」谐音\"克拉普斯\" → 克拉普斯大厦突然崩溃倒塌了，collapse = 倒塌/崩溃！"},

# --- 61-70 ---
61: {"simple":"colleague /ˈkɒliːɡ/ n.同事。词根 col-(一起)+league(联盟)→一起联盟的人→同事。同义词：coworker(同事)。","story":"新同事入职第一周，问他：\"Where's the coffee machine?\" 他带路时聊了半小时。从此两人成了最好的 colleague。","mnemonic":"「colleague」谐音\"考利格\" → 考利格是我的老同事了，colleague = 同事！"},
62: {"simple":"command /kəˈmɑːnd/ v.命令 n.掌握。词根 com-(加强)+mand(委托)→全权委托→命令。同根词：demand(要求)。","story":"将军用一个简单的 command 指挥千军万马。他说：\"A true leader knows when to command and when to listen.\"","mnemonic":"「command」谐音\"科曼德\" → 科曼德下达了紧急命令，command = 命令/掌握！"},
63: {"simple":"comment /ˈkɒment/ n./v.评论。词根 com-(加强)+ment(心智)→用心思考→评论。同根词：mental(心智的)。","story":"他发了一条朋友圈，收到了五十条 comment。最扎心的 comment 来自他妈：\"这么晚还不睡觉？\"","mnemonic":"「comment」谐音\"考门特\" → 考门特发表了对这件事的评论，comment = 评论！"},
64: {"simple":"commission /kəˈmɪʃn/ n.委员会；佣金。词根 com-(一起)+miss(发送)+ion(名词尾)→一起委派→委员会。","story":"销售拿到一笔大 commission 后请全组吃饭。老板说：\"That's what commission is for—sharing success with the team.\"","mnemonic":"「commission」谐音\"卡密神\" → 卡密神委员会决定了这笔佣金方案，commission = 委员会/佣金！"},
65: {"simple":"commit /kəˈmɪt/ v.犯(罪)；承诺。词根 com-(加强)+mit(送)→把(自己)送进去→承诺/犯罪。","story":"他在婚礼上 commit 了终身承诺。司仪说：\"Do you commit to love and cherish?\" 他大声说：\"I do. Fully committed.\"","mnemonic":"「commit」谐音\"卡密特\" → 卡密特承诺不会犯错误，commit = 承诺/犯罪！"},
66: {"simple":"communicate /kəˈmjuːnɪkeɪt/ v.沟通。词根 com-(一起)+mun(服务/公共)+icate(动词尾)→让信息公共化→沟通。","story":"夫妻吵架后冷战三天，后来发现只是没有好好 communicate。他主动说：\"We need to communicate better.\" 沟通是最好的解药。","mnemonic":"「communicate」谐音\"卡谬尼凯特\" → 卡谬尼凯特擅长与各种人沟通交流，communicate = 沟通！"},
67: {"simple":"community /kəˈmjuːnəti/ n.社区；社群。词根 com-(一起)+mun(服务)+ity(名词尾)→共同服务的群体→社区。","story":"小区 community 组织了一场义卖，连平时不说话的邻居都来了。社区大妈感慨：\"This is what community is all about.\"","mnemonic":"「community」谐音\"卡缪尼提\" → 卡缪尼提的小区社区特别团结有爱，community = 社区！"},
68: {"simple":"companion /kəmˈpæniən/ n.同伴。词根 com-(一起)+pan(面包)+ion(名词尾)→一起分面包的人→同伴。","story":"宇航员在太空站里唯一的 companion 是一个机器人。他说：\"In space, any companion is a blessing.\"","mnemonic":"「companion」谐音\"康帕尼恩\" → 康帕尼恩是我最好的旅伴，companion = 同伴！"},
69: {"simple":"compare /kəmˈpeər/ v.比较。词根 com-(一起)+pare(放置)→放在一起→比较。同根词：prepare(准备)。","story":"妈妈总拿他和别人家孩子 compare。终于有一天他说：\"Stop comparing me. Compare me only to who I was yesterday.\"","mnemonic":"「compare」谐音\"康佩尔\" → 康佩尔正在比较两款产品的优劣，compare = 比较！"},
70: {"simple":"compatible /kəmˈpætəbl/ adj.兼容的。词根 com-(一起)+pat(承受)+ible(能…的)→能一起承受的→兼容的。","story":"他换了个新手机才发现原来的充电器不 compatible。店员笑着说：\"Technology changes, compatibility doesn't always follow.\"","mnemonic":"「compatible」谐音\"康帕特波\" → 康帕特波的新系统和旧设备完全兼容，compatible = 兼容的！"},

# --- 71-80 ---
71: {"simple":"compensate /ˈkɒmpenseɪt/ v.补偿。词根 com-(加强)+pens(支付/称重)+ate(动词尾)→完全支付→补偿。","story":"航空公司弄丢了他的行李，承诺 compensate 500 美元。他说：\"Money can't compensate for my favorite hoodie.\"","mnemonic":"「compensate」谐音\"康朋斯特\" → 康朋斯特需要被赔偿丢失的物品，compensate = 补偿！"},
72: {"simple":"compete /kəmˈpiːt/ v.竞争。词根 com-(一起)+pete(追求)→一起追求→竞争。同根词：competition。","story":"兄弟俩从小 compete 到大，比成绩、比运动、比女朋友。后来他们明白：\"We're not competing against each other. We're competing together against the world.\"","mnemonic":"「compete」谐音\"康皮特\" → 康皮特在比赛中激烈竞争，compete = 竞争！"},
73: {"simple":"compile /kəmˈpaɪl/ v.编译；汇编。词根 com-(一起)+pile(堆)→堆在一起→汇编。","story":"程序员 compile 代码时屏幕疯狂滚动报错。他叹了口气：\"Why can't life compile on the first try like hello world?\"","mnemonic":"「compile」谐音\"康派尔\" → 康派尔正在编译汇编所有收集到的资料，compile = 编译/汇编！"},
74: {"simple":"complain /kəmˈpleɪn/ v.抱怨。词根 com-(加强)+plain(捶胸)→捶胸顿足→抱怨。","story":"室友每天都 complain 饭菜难吃，但从不自己做饭。终于有一天大家忍不住了：\"Stop complaining and start cooking!\"","mnemonic":"「complain」谐音\"康普兰\" → 康普兰总是抱怨天气不好，complain = 抱怨！"},
75: {"simple":"complex /ˈkɒmpleks/ adj.复杂的 n.综合体。词根 com-(一起)+plex(编织)→编织在一起的→复杂的。","story":"这个数学题太 complex 了，全班只有一个人做出来。老师感叹：\"Complex problems require simple thinking.\"","mnemonic":"「complex」谐音\"康普莱克斯\" → 康普莱克斯面对复杂问题从不退缩，complex = 复杂的！"},
76: {"simple":"component /kəmˈpəʊnənt/ n.组成部分。词根 com-(一起)+pon(放置)+ent(名词尾)→放在一起的东西→组件。","story":"工程师说这块芯片有上万个 component。他感叹：\"Every tiny component matters. One missing piece and nothing works.\"","mnemonic":"「component」谐音\"康泼嫩特\" → 康泼嫩特的机器由多个关键组成部分构成，component = 组成部分！"},
77: {"simple":"compose /kəmˈpəʊz/ v.组成；创作。词根 com-(一起)+pose(放置)→放在一起→组成/创作。","story":"作曲家用了三个月 compose 了一首交响乐。首演时他坐在后排流下了眼泪——每一个音符都是他用心 compose 的。","mnemonic":"「compose」谐音\"康剖兹\" → 康剖兹正在创作一首由多个乐章组成的乐曲，compose = 组成/创作！"},
78: {"simple":"comprehend /ˌkɒmprɪˈhend/ v.理解。词根 com-(加强)+prehend(抓住)→完全抓住→理解。","story":"留学生刚出国时几乎无法 comprehend 教授的讲课内容。半年后，他不仅能 comprehend，还能提问了。","mnemonic":"「comprehend」谐音\"康普瑞亨德\" → 康普瑞亨德终于理解了老师的用意，comprehend = 理解！"},
79: {"simple":"comprehensive /ˌkɒmprɪˈhensɪv/ adj.全面的。词根 com-(加强)+prehens(抓住)+ive(形容词尾)→全面抓住的→全面的。","story":"他做了一份 comprehensive 的旅行攻略，从机票到酒店到餐厅到景点全覆盖。朋友说：\"This is the most comprehensive guide I've ever seen!\"","mnemonic":"「comprehensive」谐音\"康普瑞亨西夫\" → 康普瑞亨西夫做了一次全面的市场调研，comprehensive = 全面的！"},
80: {"simple":"comprise /kəmˈpraɪz/ v.包含；由…组成。词根 com-(一起)+prise(拿住)→拿在一起→包含。","story":"这个展览 comprise 了 200 多位艺术家的作品。策展人说：\"Our collection comprises everything from classical to contemporary.\"","mnemonic":"「comprise」谐音\"康普莱斯\" → 康普莱斯的团队包含了各路精英人才，comprise = 包含！"},

# --- 81-90 ---
81: {"simple":"concentrate /ˈkɒnsntreɪt/ v.集中。词根 con-(一起)+centr(中心)+ate(动词尾)→集中到中心。","story":"图书馆里他戴着降噪耳机 concentrate 学习。旁边有人大声打电话，他深呼吸说：\"I choose to concentrate despite the noise.\"","mnemonic":"「concentrate」谐音\"康森吹特\" → 康森吹特需要集中注意力才能完成工作，concentrate = 集中！"},
82: {"simple":"concept /ˈkɒnsept/ n.概念。词根 con-(一起)+cept(拿)→大家一起抓住的想法→概念。","story":"物理老师用一个气球演示了相对论的 basic concept。学生恍然大悟：\"原来这么难的概念用一个气球就讲清楚了！\"","mnemonic":"「concept」谐音\"康赛普特\" → 康赛普特提出了一种全新的概念模型，concept = 概念！"},
83: {"simple":"conclude /kənˈkluːd/ v.总结；得出结论。词根 con-(一起)+clude(关闭)→一起关闭→总结。","story":"三个小时的会议终于结束了，老板说：\"Let me conclude with three words: We Did It.\" 全场鼓掌。","mnemonic":"「conclude」谐音\"康克鲁德\" → 康克鲁德在会议最后做出了总结，conclude = 总结！"},
84: {"simple":"conduct /kənˈdʌkt/ v.进行；指挥 n.行为。词根 con-(一起)+duct(引导)→引导到一起→指挥。","story":"老教授 conduct 了一辈子科研，退休前对学生说：\"Conduct your research with honesty. That's all that matters.\"","mnemonic":"「conduct」谐音\"康达克特\" → 康达克特正在指挥一场重要的科学实验，conduct = 进行/指挥！"},
85: {"simple":"conference /ˈkɒnfərəns/ n.会议。词根 con-(一起)+fer(带来)+ence(名词尾)→把意见带到一起→会议。","story":"国际 conference 上他用蹩脚的英语做完了演讲。台下掌声如雷——不是因为完美，而是因为勇气。","mnemonic":"「conference」谐音\"康佛伦斯\" → 康佛伦斯正在参加一场重要的学术会议，conference = 会议！"},
86: {"simple":"confidence /ˈkɒnfɪdəns/ n.信心。词根 con-(加强)+fid(信任)+ence(名词尾)→完全信任→信心。","story":"第一次上台演讲他紧张得发抖，但看到台下朋友鼓励的眼神，confidence 突然回来了。他说：\"Confidence is not about knowing you'll succeed, it's about knowing you'll be okay either way.\"","mnemonic":"「confidence」谐音\"康菲登斯\" → 康菲登斯对自己充满无比的信心，confidence = 信心！"},
87: {"simple":"confirm /kənˈfɜːm/ v.确认。词根 con-(加强)+firm(坚固)→使坚固→确认。同根词：firm(坚定的)。","story":"他发了封邮件 confirm 面试时间。HR 回复：\"Confirmed. See you Monday.\" 他反复看了这封邮件十遍。","mnemonic":"「confirm」谐音\"康佛姆\" → 康佛姆需要确认预定信息是否正确，confirm = 确认！"},
88: {"simple":"conflict /ˈkɒnflɪkt/ n.冲突 v.抵触。词根 con-(一起)+flict(打击)→互相打击→冲突。","story":"两兄弟为遗产起了 conflict，三年没说话。奶奶临终前说：\"Don't let money create conflict where there should be love.\"","mnemonic":"「conflict」谐音\"康弗利克特\" → 康弗利克特之间的利益冲突必须解决，conflict = 冲突！"},
89: {"simple":"conform /kənˈfɔːm/ v.遵守；符合。词根 con-(一起)+form(形状)→变成同样的形状→遵守。","story":"叛逆少年不愿 conform 学校的规则。老师说：\"You don't have to conform to be good. But some rules are there for a reason.\"","mnemonic":"「conform」谐音\"康佛姆\" → 康佛姆严格遵守着公司的规章制度，conform = 遵守/符合！"},
90: {"simple":"confront /kənˈfrʌnt/ v.面对；对抗。词根 con-(一起)+front(前面)→一起到前面→面对。","story":"他鼓起勇气 confront 了那个欺负他的人。手在抖，声音也在抖，但他说完了每一个准备好的词。那一刻他赢了。","mnemonic":"「confront」谐音\"康弗让特\" → 康弗让特勇敢地面对了自己的恐惧，confront = 面对/对抗！"},

# --- 91-100 ---
91: {"simple":"conscious /ˈkɒnʃəs/ adj.有意识的；清醒的。词根 con-(加强)+sci(知道)+ous→完全知道的→有意识的。","story":"车祸后他从昏迷中醒来，医生说：\"He's conscious!\" 母亲泪流满面。conscious 这个词在那天有了全新的重量。","mnemonic":"「conscious」谐音\"康舍斯\" → 康舍斯一直很清醒地意识到问题的严重性，conscious = 有意识的！"},
92: {"simple":"consequence /ˈkɒnsɪkwəns/ n.后果。词根 con-(加强)+sequ(跟随)+ence→随之而来的→后果。","story":"爸爸说：\"Every action has a consequence. Think before you act.\" 他当时不懂，直到后来为冲动付出了代价。","mnemonic":"「consequence」谐音\"康西昆斯\" → 康西昆斯必须为自己的行为的后果负责，consequence = 后果！"},
93: {"simple":"conservative /kənˈsɜːvətɪv/ adj.保守的。词根 con-(加强)+serv(保存)+ative→极力保存的→保守的。","story":"爷爷在投资上非常 conservative，只存定期。他自嘲：\"I'm conservative with money, but liberal with love.\"","mnemonic":"「conservative」谐音\"康瑟维提夫\" → 康瑟维提夫的保守态度让他错失很多机会，conservative = 保守的！"},
94: {"simple":"consider /kənˈsɪdər/ v.考虑；认为。词根 con-(加强)+sider(星星)→仰望星星思考→考虑。","story":"面试官说：\"We'll consider your application.\" 他知道这句话通常意味着没戏。但一周后他收到了 offer——有时候 consider 真的只是字面意思。","mnemonic":"「consider」谐音\"康西德\" → 康西德正在认真考虑你的建议，consider = 考虑！"},
95: {"simple":"consistent /kənˈsɪstənt/ adj.一致的；持续的。词根 con-(一起)+sist(站立)+ent→站在一起→一致的。","story":"健身教练说：\"Be consistent. One workout won't change anything. A hundred consistent workouts will change everything.\"","mnemonic":"「consistent」谐音\"康西斯坦特\" → 康西斯坦特的表现一直很稳定一致，consistent = 一致的/持续的！"},
96: {"simple":"constant /ˈkɒnstənt/ adj.不变的；持续的 n.常数。词根 con-(加强)+stant(站立)→始终站着的→不变的。","story":"妈妈的爱是 constant 的，无论他考多少分、闯多少祸。她说：\"My love is the only constant in this changing world.\"","mnemonic":"「constant」谐音\"康斯坦特\" → 康斯坦特提供着恒定不变的持续支持，constant = 不变的/持续的！"},
97: {"simple":"constitute /ˈkɒnstɪtjuːt/ v.构成。词根 con-(一起)+stitute(建立)→一起建立→构成。","story":"老师说：\"Twelve jurors constitute a jury. One voice can constitute the difference between guilty and innocent.\"","mnemonic":"「constitute」谐音\"康斯蒂丢特\" → 这些部分康斯蒂丢特构成了一个完整的整体，constitute = 构成！"},
98: {"simple":"construct /kənˈstrʌkt/ v.建造；构建。词根 con-(一起)+struct(建造)→一起建造→构建。","story":"孩子们用积木 construct 了一座城堡。最小的妹妹一推就倒了，哥哥说：\"We'll construct it again, stronger this time.\"","mnemonic":"「construct」谐音\"康斯拉克特\" → 康斯拉克特正在建造一栋摩天大楼，construct = 建造/构建！"},
99: {"simple":"consult /kənˈsʌlt/ v.咨询；查阅。词根 con-(一起)+sult(召集)→召集到一起讨论→咨询。","story":"他 consult 了五个医生才确诊病情。\"Always consult a second opinion,\" 他后来总是这样提醒朋友。","mnemonic":"「consult」谐音\"康少特\" → 康少特去咨询了法律顾问的意见，consult = 咨询！"},
100: {"simple":"consume /kənˈsjuːm/ v.消费；消耗。词根 con-(完全)+sume(拿)→完全拿走→消耗。","story":"每天上下班通勤 consume 他三个小时。他算了算一年 consume 在路上的时间够学两门语言了，第二天就换了房子。","mnemonic":"「consume」谐音\"康苏姆\" → 康苏姆的消费习惯需要改变，consume = 消费/消耗！"},

# --- 101-110 ---
101: {"simple":"contact /ˈkɒntækt/ n./v.联系。词根 con-(一起)+tact(触摸)→互相触摸→联系。","story":"失散二十年的兄弟终于通过社交媒体 contact 上了。第一次视频通话时两人都哭了——有些 contact 比金子还珍贵。","mnemonic":"「contact」谐音\"康泰克特\" → 康泰克特终于联系上了失散的老友，contact = 联系！"},
102: {"simple":"contain /kənˈteɪn/ v.包含；容纳。词根 con-(一起)+tain(持)→持有在一起→包含。","story":"这个小小的 U 盘 contain 了他二十年的所有照片。他说：\"A lifetime of memories contained in something smaller than my thumb.\"","mnemonic":"「contain」谐音\"康泰恩\" → 康泰恩的报告中包含了所有必要的数据，contain = 包含！"},
103: {"simple":"contemporary /kənˈtemprəri/ adj.当代的 n.同龄人。词根 con-(一起)+tempor(时间)+ary→同时间的→当代的。","story":"美术馆的 contemporary art 展览让他摸不着头脑。一个白色方块就是作品？导览说：\"Contemporary art makes you think, not just look.\"","mnemonic":"「contemporary」谐音\"康泰普瑞瑞\" → 康泰普瑞瑞是当代最杰出的艺术家，contemporary = 当代的！"},
104: {"simple":"context /ˈkɒntekst/ n.上下文；背景。词根 con-(一起)+text(编织)→编织在一起的→上下文。","story":"他引用了一句名言被骂惨了，因为完全脱离了 context。他说：\"Lesson learned: Never quote without context.\"","mnemonic":"「context」谐音\"康泰克斯特\" → 康泰克斯特需要结合上下文理解这段话，context = 上下文！"},
105: {"simple":"contract /ˈkɒntrækt/ n.合同 v.收缩。词根 con-(一起)+tract(拉)→拉到一起→合同/收缩。","story":"他认真读了三遍 contract 才签字。律师说：\"Always read the contract. The fine print is where devils hide.\"","mnemonic":"「contract」谐音\"康揣克特\" → 康揣克特签下了一份重要的合同，contract = 合同！"},
106: {"simple":"contradict /ˌkɒntrəˈdɪkt/ v.矛盾；反驳。词根 contra-(反对)+dict(说)→反着说→反驳。","story":"他的言行总是 contradict 自己，说一套做一套。朋友劝他：\"Don't contradict yourself. Be who you say you are.\"","mnemonic":"「contradict」谐音\"康揣迪克特\" → 康揣迪克特的话自相矛盾无法让人信服，contradict = 矛盾/反驳！"},
107: {"simple":"contrary /ˈkɒntrəri/ adj.相反的 n.反面。词根 contra-(反对)+ry→反对的→相反的。","story":"大家都往左走，他偏往右。\"On the contrary,\" 他说，\"I think the treasure is this way.\" 结果他真的找到了。","mnemonic":"「contrary」谐音\"康揣瑞\" → 康揣瑞的观点与大家完全相反，contrary = 相反的！"},
108: {"simple":"contrast /ˈkɒntrɑːst/ n./v.对比。词根 contra-(反对)+st(站立)→对着站→对比。","story":"他把两张照片放在一起 contrast：一张是十年前，一张是现在。\"The contrast is striking,\" 他感叹道。","mnemonic":"「contrast」谐音\"康揣斯特\" → 康揣斯特把两张图放在一起对比，contrast = 对比！"},
109: {"simple":"contribute /kənˈtrɪbjuːt/ v.贡献。词根 con-(一起)+tribute(给予)→一起给予→贡献。","story":"他匿名 contribute 了一笔钱给母校。校长在大会上说：\"Someone contributed without leaving a name. That's the purest form of giving.\"","mnemonic":"「contribute」谐音\"康揣不特\" → 康揣不特对团队做出了巨大贡献，contribute = 贡献！"},
110: {"simple":"controversy /ˈkɒntrəvɜːsi/ n.争议。词根 contro-(反对)+vers(转)+y→转向对立→争议。","story":"这部电影引发了巨大的 controversy，有人说是杰作，有人说是垃圾。导演说：\"Controversy means people care.\"","mnemonic":"「controversy」谐音\"康绰维西\" → 康绰维西的争议性发言引发了激烈讨论，controversy = 争议！"},

# --- 111-120 ---
111: {"simple":"convenient /kənˈviːniənt/ adj.方便的。词根 con-(一起)+ven(来)+ient→一起来到一起→方便的。","story":"搬家后楼下就是地铁站，太 convenient 了！他说：\"Convenience is the secret ingredient of happiness in city life.\"","mnemonic":"「convenient」谐音\"康维尼恩特\" → 康维尼恩特觉得新家位置特别方便，convenient = 方便的！"},
112: {"simple":"convention /kənˈvenʃn/ n.大会；惯例。词根 con-(一起)+vent(来)+ion→聚到一起→大会/惯例。","story":"漫展 convention 上他 cos 成最喜欢的角色，被一群人求合影。他说：\"Convention is where weird becomes normal.\"","mnemonic":"「convention」谐音\"康维神\" → 康维神参加了一场行业惯例大会，convention = 大会/惯例！"},
113: {"simple":"convert /kənˈvɜːt/ v.转变；皈依。词根 con-(加强)+vert(转)→完全转变→转变。","story":"他把旧仓库 convert 成了咖啡馆，成了网红打卡地。\"Converting spaces is converting lives,\" 他这样总结。","mnemonic":"「convert」谐音\"康沃特\" → 康沃特把车库转变成了健身房，convert = 转变！"},
114: {"simple":"convey /kənˈveɪ/ v.传达；运送。词根 con-(一起)+vey(路)→一起送上路→传达/运送。","story":"他试图 convey 自己的感激之情，但嘴笨说不出来。最后他只说了句 \"Thank you\"，但眼神 convey 了一切。","mnemonic":"「convey」谐音\"康维\" → 康维成功传达了会议的核心精神，convey = 传达！"},
115: {"simple":"convince /kənˈvɪns/ v.说服。词根 con-(加强)+vince(征服)→完全征服→说服。","story":"他花了两个小时 convince 爸妈让他出国留学。最后他说的一句话打动了他们：\"Trust me to make you proud.\"","mnemonic":"「convince」谐音\"康文斯\" → 康文斯终于说服大家接受了他的方案，convince = 说服！"},
116: {"simple":"cooperate /kəʊˈɒpəreɪt/ v.合作。词根 co-(一起)+oper(工作)+ate→一起工作→合作。","story":"两个死对头被迫 cooperate 完成项目。结果发现对方其实挺厉害的，项目结束后他们还成了朋友。","mnemonic":"「cooperate」谐音\"扣奥普瑞特\" → 扣奥普瑞特之间的合作让项目大有进展，cooperate = 合作！"},
117: {"simple":"coordinate /kəʊˈɔːdɪneɪt/ v.协调 n.坐标。词根 co-(一起)+ordin(顺序)+ate→使顺序一致→协调。","story":"项目经理需要 coordinate 五个团队同时推进。她说：\"Coordinating people is harder than solving equations.\"","mnemonic":"「coordinate」谐音\"扣奥地尼特\" → 扣奥地尼特需协调各部门的工作进度，coordinate = 协调！"},
118: {"simple":"core /kɔːr/ n.核心 adj.核心的。源自拉丁语 cor(心)。core values 核心价值观，core business 核心业务。","story":"健身教练说：\"Strengthen your core first. Without a strong core, everything else is unstable.\" 这话也适用于人生。","mnemonic":"「core」谐音\"科尔\" → 科尔是团队中最核心的成员，core = 核心！"},
119: {"simple":"corporate /ˈkɔːpərət/ adj.公司的。词根 corpor-(身体/团体)+ate→形成团体→公司的。","story":"他在 corporate world 打拼了十年，最后辞去高薪开了一家小书店。他说：\"Corporate life pays bills, but books feed the soul.\"","mnemonic":"「corporate」谐音\"科泼瑞特\" → 科泼瑞特的公司文化非常注重创新，corporate = 公司的！"},
120: {"simple":"correspond /ˌkɒrəˈspɒnd/ v.对应；通信。词根 cor-(一起)+respond(回应)→相互回应→通信/对应。","story":"奶奶和他 correspond 了十年书信。每封信都以 \"My dear grandson\" 开头。那些信件是他最珍贵的财富。","mnemonic":"「correspond」谐音\"科瑞斯邦德\" → 科瑞斯邦德的数据与实际完全对应，correspond = 对应！"},

# --- 121-130 ---
121: {"simple":"council /ˈkaʊnsl/ n.委员会；议会。词根 coun-(一起)+cil(召集)→召集到一起→委员会。注意区分 counsel(建议)。","story":"市 council 开会讨论公园改造方案，吵了三个小时。最后一个小女孩举手说：\"Can we just have more swings?\" 全票通过。","mnemonic":"「council」谐音\"康叟\" → 康叟是市议会的重要成员，council = 委员会！"},
122: {"simple":"counterpart /ˈkaʊntəpɑːt/ n.对应的人/物。词根 counter-(相对的)+part(部分)→相对的部分→对应物。","story":"他见到了自己的 Chinese counterpart——一个同样做市场的中年人。两人用半生不熟的英语聊了两小时。","mnemonic":"「counterpart」谐音\"康特帕特\" → 康特帕特是他在国外的对应职位同事，counterpart = 对应的人！"},
123: {"simple":"crack /kræk/ v.裂开 n.裂缝。拟声词，模仿破裂声\"咔\"。crack a joke 开玩笑。","story":"墙上有一条 crack，他每天看着它慢慢变大。终于有一天他修好了它——就像他终于直面自己的心结。","mnemonic":"「crack」谐音\"克瑞克\" → 克瑞克墙上的裂缝越来越大需要立即修补，crack = 裂开/裂缝！"},
124: {"simple":"crash /kræʃ/ v.撞击 n.坠毁。拟声词，模仿撞击声\"咔嚓\"。crash course 速成课。","story":"电脑突然 crash 了他没保存的论文。绝望之际想起了 crash course 上学到的快捷键，文件竟然恢复了！","mnemonic":"「crash」谐音\"克瑞什\" → 克瑞什驾驶的汽车突然撞上了一棵树，crash = 撞击/坠毁！"},
125: {"simple":"create /kriˈeɪt/ v.创造。词根 cre-(生长)+ate→使生长→创造。同根词：creative(有创造力的)。","story":"他用回收的废铁 create 了一个机器人雕塑。邻居们纷纷来参观，他说：\"I just wanted to create something beautiful from ugly.\"","mnemonic":"「create」谐音\"克瑞特\" → 克瑞特创造了一个全新的世界纪录，create = 创造！"},
126: {"simple":"credit /ˈkredɪt/ n.信用；学分 v.归功于。词根 cred-(相信)+it→相信→信用。","story":"银行因为他没有 credit history 拒绝了贷款。他苦笑：\"How am I supposed to build credit if no one gives me credit?\"","mnemonic":"「credit」谐音\"克瑞迪特\" → 克瑞迪特的信用记录一直都很好，credit = 信用！"},
127: {"simple":"crisis /ˈkraɪsɪs/ n.危机。源自希腊语 krisis(决定性的时刻)。crisis 中也藏着 opportunity(机会)。","story":"金融危机时他丢了工作，但在这 crisis 中他发现了创业机会。后来他说：\"Every crisis carries a gift wrapped in fear.\"","mnemonic":"「crisis」谐音\"克瑞西斯\" → 克瑞西斯正面临着前所未有的危机，crisis = 危机！"},
128: {"simple":"criterion /kraɪˈtɪəriən/ n.标准(单数)。复数 criteria。源自希腊语 kriterion(判断标准)。","story":"面试官说：\"What's your criterion for choosing a job?\" 他想了想：\"Growth potential. That's my only criterion.\"","mnemonic":"「criterion」谐音\"克瑞蹄瑞恩\" → 克瑞蹄瑞恩设定的选择标准非常严格，criterion = 标准！"},
129: {"simple":"critical /ˈkrɪtɪkl/ adj.批评的；关键的。词根 crit-(判断)+ical→判断性的→批评的/关键的。","story":"医生说病人的状况很 critical，需要立刻手术。\"Every second is critical,\" 护士推着病床飞奔。","mnemonic":"「critical」谐音\"克瑞提扣\" → 克瑞提扣在关键时刻做出了正确决定，critical = 关键的！"},
130: {"simple":"crucial /ˈkruːʃl/ adj.至关重要的。源自拉丁语 crux(十字路口)→决定性的→至关重要的。","story":"裁判说这最后一球对比赛结果 crucial。结果他投偏了。但多年后他说：\"That miss was crucial to who I became.\"","mnemonic":"「crucial」谐音\"克鲁手\" → 克鲁手做出了一个至关重要的决定，crucial = 至关重要的！"},

# --- 131-140 ---
131: {"simple":"cultivate /ˈkʌltɪveɪt/ v.培养；耕作。词根 cult-(耕种)+ivate(动词尾)→耕作→培养。","story":"爷爷用一辈子 cultivate 了一片果园。他说：\"Cultivating trees is like cultivating character. Both take patience and love.\"","mnemonic":"「cultivate」谐音\"考提维特\" → 考提维特花了十年培养自己的音乐天赋，cultivate = 培养！"},
132: {"simple":"curb /kɜːb/ v.抑制 n.路缘。源自拉丁语 curvus(弯曲的)。curb inflation 抑制通胀。","story":"他努力 curb 自己买奶茶的冲动，省下钱去买了一直想要的书。\"Sometimes you need to curb small pleasures for bigger ones.\"","mnemonic":"「curb」谐音\"科布\" → 科布需要抑制自己不切实际的冲动，curb = 抑制！"},
133: {"simple":"currency /ˈkʌrənsi/ n.货币；流通。词根 curr-(流动)+ency(名词尾)→流通的→货币。","story":"出国前他换了三种 currency，钱包鼓得像要炸。到了才发现好多地方都只收卡——currency 正在被时代改变。","mnemonic":"「currency」谐音\"卡润西\" → 卡润西需要兑换当地货币才能消费，currency = 货币！"},
134: {"simple":"cycle /ˈsaɪkl/ n.循环；周期 v.骑自行车。词根 cycl-(圆/循环)+e→循环。","story":"他发现了一个 cycle：周一倦怠，周二恢复，周三高效，周四疲惫，周五兴奋。\"Life runs in cycles,\" 他想。","mnemonic":"「cycle」谐音\"赛扣\" → 赛扣每天骑自行车重复着同样的周期路线，cycle = 循环！"},
135: {"simple":"debate /dɪˈbeɪt/ n./v.辩论。词根 de-(向下)+bat(打)→打下来→辩论。","story":"辩论赛上他 debate 得面红耳赤，但他最好的朋友在对方阵营。赛后两人去吃了火锅——debate 不影响友谊。","mnemonic":"「debate」谐音\"迪贝特\" → 迪贝特在辩论赛中展现出了优秀的表达能力，debate = 辩论！"},
136: {"simple":"decade /ˈdekeɪd/ n.十年。词根 dec-(十)+ade→十个一组→十年。","story":"翻出 decade 前的照片，发型不忍直视。他感慨：\"A decade changes everything except the memories of being young and stupid.\"","mnemonic":"「decade」谐音\"德凯德\" → 德凯德花了十年时间才完成这项研究，decade = 十年！"},
137: {"simple":"decline /dɪˈklaɪn/ v.下降；拒绝 n.衰退。词根 de-(向下)+cline(倾斜)→向下倾斜→下降。","story":"他 decline 了一个高薪 offer，选择去支教。朋友说他疯了，他说：\"I decline money for meaning.\"","mnemonic":"「decline」谐音\"迪克莱恩\" → 迪克莱恩婉拒了这个请求，decline = 下降/拒绝！"},
138: {"simple":"decorate /ˈdekəreɪt/ v.装饰。词根 decor-(装饰)+ate→装饰。同根词：decoration(装饰品)。","story":"圣诞节他把家里 decorate 得像童话世界一样。邻居都来拍照，他说：\"Decorating is my way of spreading joy.\"","mnemonic":"「decorate」谐音\"德科瑞特\" → 德科瑞特用心装饰了他的新房间，decorate = 装饰！"},
139: {"simple":"dedicate /ˈdedɪkeɪt/ v.致力于；献身。词根 de-(向下)+dic(说/奉献)+ate→宣誓奉献→致力于。","story":"他 dedicate 了一生研究濒危动物。临终前他说：\"I dedicated my life to those who can't speak for themselves.\"","mnemonic":"「dedicate」谐音\"德迪凯特\" → 德迪凯特毕生致力于科学研究，dedicate = 致力于！"},
140: {"simple":"deduce /dɪˈdjuːs/ v.推断；演绎。词根 de-(向下)+duce(引导)→往下推导→推断。","story":"侦探从几根头发 deduce 出了整个犯罪过程。助手惊叹：\"How did you deduce that?\" 他笑了笑：\"Elementary.\"","mnemonic":"「deduce」谐音\"迪丢斯\" → 迪丢斯从这些线索中推断出了结论，deduce = 推断！"},

# --- 141-150 ---
141: {"simple":"defect /ˈdiːfekt/ n.缺陷 v.叛逃。词根 de-(离开)+fect(做)→做坏了→缺陷。","story":"质检员发现了一件有 defect 的产品。老板说：\"One defect is one too many. Find the root cause.\"","mnemonic":"「defect」谐音\"迪菲特\" → 迪菲特发现产品存在严重缺陷，defect = 缺陷！"},
142: {"simple":"deficit /ˈdefɪsɪt/ n.赤字；不足。词根 de-(离开)+fic(做)+it→做得不够→赤字。","story":"公司财报显示巨额 deficit，CEO 引咎辞职。新任 CEO 说：\"We'll turn this deficit into surplus. Just watch.\"","mnemonic":"「deficit」谐音\"德费西特\" → 德费西特发现公司财政出现了赤字，deficit = 赤字！"},
143: {"simple":"define /dɪˈfaɪn/ v.定义；界定。词根 de-(完全)+fine(界限)→完全划清界限→定义。","story":"老师问：\"How do you define success?\" 每个学生答案都不同。老师说：\"Exactly. Define it for yourself, not for others.\"","mnemonic":"「define」谐音\"迪范恩\" → 迪范恩需要先定义清楚问题的边界，define = 定义！"},
144: {"simple":"defy /dɪˈfaɪ/ v.违抗；挑战。词根 de-(离开)+fy(信任)→脱离信任→违抗。","story":"他 defy 了所有人的预期，一个学渣考上了名校。\"Sometimes you need to defy expectations to find your true self.\"","mnemonic":"「defy」谐音\"迪费\" → 迪费勇于违抗不合理的规则，defy = 违抗/挑战！"},
145: {"simple":"deliberate /dɪˈlɪbərət/ adj.故意的 v.仔细考虑。词根 de-(完全)+liber(权衡)+ate→完全权衡→仔细考虑。","story":"他说伤人的话不是 deliberate 的，但伤害已经造成。道歉时他说：\"Intentional or not, the pain was real. I'm sorry.\"","mnemonic":"「deliberate」谐音\"迪利伯瑞特\" → 迪利伯瑞特故意绕开了正题，deliberate = 故意的！"},
146: {"simple":"delicate /ˈdelɪkət/ adj.精致的；脆弱的。词根 de-(加强)+lic(吸引)+ate→非常吸引人的→精致的。","story":"奶奶拿出一套 delicate 的瓷器，说是结婚时的嫁妆。\"Handle with care. Delicate things carry the most memories.\"","mnemonic":"「delicate」谐音\"德利凯特\" → 德利凯特小心翼翼地处理着这件精致的艺术品，delicate = 精致的！"},
147: {"simple":"deliver /dɪˈlɪvər/ v.递送；发表(演讲)。词根 de-(完全)+liver(释放)→完全释放→递送。","story":"快递小哥冒雨 deliver 了包裹，还特意用塑料袋包了一层。\"Delivering smiles, not just packages,\" 他的签名这样写。","mnemonic":"「deliver」谐音\"迪利沃\" → 迪利沃按时递送了所有重要的包裹，deliver = 递送！"},
148: {"simple":"demand /dɪˈmɑːnd/ n./v.要求。词根 de-(向下)+mand(委托)→委派下去→要求。","story":"客户 demand 三天内交付方案，团队加班加点。项目经理说：\"Demand drives progress. But unreasonable demand drives burnout.\"","mnemonic":"「demand」谐音\"迪曼德\" → 迪曼德对服务质量提出了很高的要求，demand = 要求！"},
149: {"simple":"demonstrate /ˈdemənstreɪt/ v.演示；证明。词根 de-(完全)+monstr(展示)+ate→完全展示→演示。","story":"他用一个简单的实验 demonstrate 了重力原理。学生看完惊呼：\"Now I get it!\" 他说：\"That's the power of demonstrating.\"","mnemonic":"「demonstrate」谐音\"德蒙斯垂特\" → 德蒙斯垂特给大家演示了新产品的操作方法，demonstrate = 演示！"},
150: {"simple":"deny /dɪˈnaɪ/ v.否认；拒绝。词根 de-(完全)+ny(否定)→完全否定→否认。","story":"小孩偷吃饼干被当场抓获，嘴上还挂着渣渣却 deny 到底。妈妈说：\"You can't deny when the evidence is on your face!\"","mnemonic":"「deny」谐音\"迪奈\" → 迪奈坚决否认自己犯了错误，deny = 否认！"},

# --- 151-160 ---
151: {"simple":"depict /dɪˈpɪkt/ v.描绘；描述。词根 de-(完全)+pict(画)→完全画出来→描绘。","story":"他的画 depict 了一个孤独的孩子站在雨里。他说：\"Art doesn't just depict reality. It depicts emotion.\"","mnemonic":"「depict」谐音\"迪匹克特\" → 迪匹克特在画中描绘了一幅美丽的风景，depict = 描绘！"},
152: {"simple":"deposit /dɪˈpɒzɪt/ v.存放 n.押金；存款。词根 de-(向下)+posit(放置)→放下→存放。","story":"他去银行 deposit 了第一个月工资。柜员递回收据时微笑着说：\"First deposit is always special.\"","mnemonic":"「deposit」谐音\"迪普席特\" → 迪普席特去银行存了一笔定期存款，deposit = 存放/存款！"},
153: {"simple":"depress /dɪˈpres/ v.使沮丧；按下。词根 de-(向下)+press(压)→向下压→使沮丧。","story":"连续下雨一周让他 feel depressed。朋友说：\"Don't let weather depress you. Dance in the rain instead.\"","mnemonic":"「depress」谐音\"迪普瑞斯\" → 迪普瑞斯因为失业而感到非常沮丧，depress = 使沮丧！"},
154: {"simple":"derive /dɪˈraɪv/ v.得到；源自。词根 de-(从)+rive(河流)→从源头流出来→源自。","story":"很多英语单词 derive 自拉丁语。老师说：\"Once you understand where words derive from, English becomes a puzzle, not a burden.\"","mnemonic":"「derive」谐音\"迪瑞夫\" → 迪瑞夫成功的秘诀源自他不懈的努力，derive = 源自/得到！"},
155: {"simple":"deserve /dɪˈzɜːv/ v.值得；应得。词根 de-(完全)+serve(服务)→完全应得服务→值得。","story":"他获得年度员工时只说了一句：\"I don't know if I deserve this.\" 老板说：\"You deserve it more than anyone.\"","mnemonic":"「deserve」谐音\"迪泽夫\" → 迪泽夫的努力配得上这份奖赏，deserve = 值得！"},
156: {"simple":"design /dɪˈzaɪn/ v./n.设计。词根 de-(完全)+sign(标记)→完全做标记→设计。","story":"她 design 了一套环保包装，被大公司花百万买走授权。她说：\"Good design solves problems. Great design changes behavior.\"","mnemonic":"「design」谐音\"迪赛恩\" → 迪赛恩为这座建筑设计了独特的风格，design = 设计！"},
157: {"simple":"desperate /ˈdespərət/ adj.绝望的；不顾一切的。词根 de-(离开)+sper(希望)+ate→离开希望的→绝望的。","story":"他 desperate 地投了 200 份简历，终于在第 201 封收到了面试邀请。\"Desperate times call for desperate persistence.\"","mnemonic":"「desperate」谐音\"德思泼瑞特\" → 德思泼瑞特陷入了绝望的境地急需帮助，desperate = 绝望的！"},
158: {"simple":"destine /ˈdestɪn/ v.注定。词根 de-(向下)+stin(站)→立定→注定。同根词：destiny(命运)。","story":"他们相遇在图书馆同一本书前，后来在一起了。朋友们说：\"You two were destined to meet.\"","mnemonic":"「destine」谐音\"德思汀\" → 德思汀注定要成为一名伟大的科学家，destine = 注定！"},
159: {"simple":"detect /dɪˈtekt/ v.发现；探测。词根 de-(除去)+tect(盖)→除去盖子→发现。","story":"机场安检 detect 了他包里的可疑物品，原来只是一块忘记吃的三明治。虚惊一场但还是被没收了。","mnemonic":"「detect」谐音\"迪泰克特\" → 迪泰克特用仪器探测到了埋藏地下的金属，detect = 发现/探测！"},
160: {"simple":"deteriorate /dɪˈtɪəriəreɪt/ v.恶化。词根 deterior-(更差)+ate→变得更差→恶化。","story":"爷爷的健康开始 deteriorate 后，他搬回家照顾。\"Don't let relationships deteriorate like health,\" 这是爷爷教他的最后一课。","mnemonic":"「deteriorate」谐音\"迪替瑞瑞特\" → 迪替瑞瑞特的健康状况正在持续恶化，deteriorate = 恶化！"},

# --- 161-170 ---
161: {"simple":"determine /dɪˈtɜːmɪn/ v.决定；确定。词根 de-(完全)+termin(界限)+e→完全划定界限→决定。","story":"他 determine 要成为医生，尽管所有人都说太难了。十年后他穿着白大褂说：\"Determination determines destiny.\"","mnemonic":"「determine」谐音\"迪特敏\" → 迪特敏决定要考第一名，determine = 决定！"},
162: {"simple":"devastate /ˈdevəsteɪt/ v.摧毁；使悲痛。词根 de-(完全)+vast(空旷)+ate→使完全空旷→摧毁。","story":"地震 devastate 了整座城市，但 devastate 不了人们的希望。志愿者说：\"What was devastated can be rebuilt.\"","mnemonic":"「devastate」谐音\"德沃斯泰特\" → 德沃斯泰特的家园被洪水彻底摧毁了，devastate = 摧毁！"},
163: {"simple":"develop /dɪˈveləp/ v.发展；开发。词根 de-(解开)+velop(包裹)→解开包裹→发展。","story":"他花了两年 develop 这个 app，上架第一天只有 3 个下载。现在它有一百万用户——develop 就是一个解锁的过程。","mnemonic":"「develop」谐音\"迪维勒普\" → 迪维勒普正在开发一款全新的教育软件，develop = 发展/开发！"},
164: {"simple":"device /dɪˈvaɪs/ n.设备。词根 de-(分开)+vice(看)→分开看→装置。区分 devise(v.设计)。","story":"他的手机是唯一连接世界的 device。丢了那天他 panic 了三小时——现代人有多依赖一个小小的 device。","mnemonic":"「device」谐音\"迪外斯\" → 迪外斯发明了一种全新的智能设备，device = 设备！"},
165: {"simple":"devote /dɪˈvəʊt/ v.奉献。词根 de-(完全)+vot(发誓)→发誓忠于→奉献。","story":"她 devote 了三十年给教育事业，退休时学生遍布世界各地。她说：\"Devotion is love in action.\"","mnemonic":"「devote」谐音\"迪沃特\" → 迪沃特把一生奉献给了科学事业，devote = 奉献！"},
166: {"simple":"diagnose /ˈdaɪəɡnəʊz/ v.诊断。词根 dia-(穿过)+gnose(知道)→透过现象知道本质→诊断。","story":"医生花了三个月才 diagnose 出他的罕见病。他说：\"The wait was scary, but finally having a diagnosis was a relief.\"","mnemonic":"「diagnose」谐音\"戴阿格诺斯\" → 戴阿格诺斯被医生诊断为轻微疲劳，diagnose = 诊断！"},
167: {"simple":"dimension /daɪˈmenʃn/ n.维度；尺寸。词根 di-(分开)+mens(测量)+ion→分开测量→维度。","story":"科幻片里的四维空间让观众脑洞大开。物理教授说：\"Fourth dimension is not just sci-fi. It's the fabric of our universe.\"","mnemonic":"「dimension」谐音\"戴门神\" → 戴门神从多个维度分析了这个问题，dimension = 维度！"},
168: {"simple":"diminish /dɪˈmɪnɪʃ/ v.减少；缩小。词根 di-(分开)+min(小)+ish→使变小→减少。","story":"城市的绿地面积逐年 diminish，他组建了环保小组试图阻止。\"Don't let hope diminish,\" 他对成员们说。","mnemonic":"「diminish」谐音\"迪米尼西\" → 迪米尼西的影响力正在逐渐减少，diminish = 减少！"},
169: {"simple":"discipline /ˈdɪsəplɪn/ n.纪律；学科 v.训练。词根 discip-(学生)+line→学生的准则→纪律。","story":"健身最重要的是 discipline，不是动力。他说：\"Motivation gets you started. Discipline keeps you going when motivation is gone.\"","mnemonic":"「discipline」谐音\"丁瑟普林\" → 丁瑟普林有着严格的纪律约束自己，discipline = 纪律！"},
170: {"simple":"disclose /dɪsˈkləʊz/ v.揭露；公开。词根 dis-(不)+close(关闭)→不关闭→公开。","story":"举报人不顾危险 disclose 了公司黑幕。记者问他怕不怕，他说：\"Truth disclosed is freedom earned.\"","mnemonic":"「disclose」谐音\"迪斯克鲁兹\" → 迪斯克鲁兹揭露了事件背后的真相，disclose = 揭露！"},

# --- 171-180 ---
171: {"simple":"discriminate /dɪˈskrɪmɪneɪt/ v.歧视；区分。词根 dis-(分开)+crimin(判断)+ate→分开判断→区分/歧视。","story":"他因为是外地人被 discriminate。但后来他用实力让所有人闭嘴：\"Discrimination only exists where ignorance thrives.\"","mnemonic":"「discriminate」谐音\"迪斯克瑞米内特\" → 不能迪斯克瑞米内特任何人，discriminate = 歧视！"},
172: {"simple":"dismiss /dɪsˈmɪs/ v.解雇；驳回。词根 dis-(离开)+miss(送)→送走→解雇。","story":"他被 dismiss 后一个人在公园发呆。三个月后他创业成功，给前老板寄了张明信片：\"Thanks for dismissing me.\"","mnemonic":"「dismiss」谐音\"迪斯密斯\" → 迪斯密斯因为旷工被公司解雇了，dismiss = 解雇！"},
173: {"simple":"disorder /dɪsˈɔːdər/ n.混乱；疾病。词根 dis-(不)+order(秩序)→无秩序→混乱。","story":"他的房间 disorder 到他妈都放弃了。但他说这叫做\"creative disorder\"——每一堆杂物都是创作的火花。","mnemonic":"「disorder」谐音\"迪斯奥德\" → 迪斯奥德的生活作息完全混乱无序，disorder = 混乱！"},
174: {"simple":"display /dɪˈspleɪ/ v./n.展示。词根 dis-(分开)+play(折叠)→把折叠的展开→展示。","story":"他把奖杯 display 在客厅最显眼的位置。朋友笑他虚荣，他说：\"I display them not for pride, but to remind myself what's possible.\"","mnemonic":"「display」谐音\"迪斯普雷\" → 迪斯普雷在展会上展示了公司的新产品，display = 展示！"},
175: {"simple":"dispose /dɪˈspəʊz/ v.处理；安排。词根 dis-(分开)+pose(放置)→分开放置→处理。","story":"他 dispose 了所有不穿的衣服捐给了慈善机构。\"Disposing clutter is the first step to a clearer mind.\"","mnemonic":"「dispose」谐音\"迪斯剖兹\" → 迪斯剖兹需要妥善处理这些废弃物品，dispose = 处理！"},
176: {"simple":"dispute /dɪˈspjuːt/ n./v.争论。词根 dis-(分开)+pute(想)→想法不同→争论。","story":"邻里间因为围墙高度 dispute 了半年。最后两家孩子成了好朋友，大人们只好握手言和。","mnemonic":"「dispute」谐音\"迪斯普特\" → 迪斯普特正在和邻居争论土地边界问题，dispute = 争论！"},
177: {"simple":"dissolve /dɪˈzɒlv/ v.溶解；解散。词根 dis-(分开)+solve(松开)→松开分散→溶解。","story":"他把糖放进咖啡里看它 dissolve。\"Some problems dissolve with time,\" 他若有所思。","mnemonic":"「dissolve」谐音\"迪泽尔夫\" → 迪泽尔夫看着糖在水中慢慢溶解，dissolve = 溶解！"},
178: {"simple":"distinct /dɪˈstɪŋkt/ adj.明显的；独特的。词根 dis-(分开)+stinct(刺)→刺出分开的→明显的。","story":"他有一种 distinct 的写作风格，别人模仿不来。编辑说：\"Your voice is distinct. Don't let anyone dilute it.\"","mnemonic":"「distinct」谐音\"迪斯汀克特\" → 迪斯汀克特的声音有着独特的辨识度，distinct = 明显的/独特的！"},
179: {"simple":"distinguish /dɪˈstɪŋɡwɪʃ/ v.区分；辨别。词根 dis-(分开)+stingu(刺)+ish→区别刺出来→区分。","story":"双胞胎长得太像，连妈妈有时都 distinguish 不出来。哥哥故意染了一撮蓝头发：\"Now you can distinguish us easily.\"","mnemonic":"「distinguish」谐音\"迪斯汀贵希\" → 迪斯汀贵希能轻易区分真品和仿品，distinguish = 区分！"},
180: {"simple":"distort /dɪˈstɔːt/ v.扭曲；歪曲。词根 dis-(分开)+tort(扭)→扭开→扭曲。","story":"媒体 distort 了他的原话，他不得不在社交媒体上澄清。\"Truth gets distorted in the game of clicks.\"","mnemonic":"「distort」谐音\"迪斯多特\" → 迪斯多特扭曲了事实来误导大家，distort = 扭曲！"},

# --- 181-190 ---
181: {"simple":"distribute /dɪˈstrɪbjuːt/ v.分配；分发。词根 dis-(分开)+tribute(给)→分给大家→分发。","story":"志愿者们在灾区 distribute 物资，一个老人握着他们的手说：\"You're not just distributing food. You're distributing hope.\"","mnemonic":"「distribute」谐音\"迪斯吹不特\" → 迪斯吹不特需要公平地分配这些资源，distribute = 分配/分发！"},
182: {"simple":"diverse /daɪˈvɜːs/ adj.多样的。词根 di-(分开)+verse(转)→转向不同方向的→多样的。","story":"他的朋友圈非常 diverse：有画家、程序员、厨师。\"Diverse friends bring diverse perspectives,\" 他说。","mnemonic":"「diverse」谐音\"戴沃斯\" → 戴沃斯的团队成员背景非常多样化，diverse = 多样的！"},
183: {"simple":"document /ˈdɒkjumənt/ n.文件 v.记录。词根 docu-(教导)+ment→教导的材料→文件。","story":"他把留学生活 document 成一部 vlog，意外火了。他说：\"I just wanted to document my journey. Never expected this.\"","mnemonic":"「document」谐音\"道克门特\" → 道克门特正在整理重要的文件资料，document = 文件/记录！"},
184: {"simple":"domestic /dəˈmestɪk/ adj.国内的；家庭的。词根 dom-(家)+estic→家庭的→国内的。","story":"他做 domestic 航班飞回家过年，机场里全是背着大包小包的人。\"Domestic flights during Spring Festival are a unique spectacle.\"","mnemonic":"「domestic」谐音\"德迈斯提克\" → 德迈斯提克更喜欢国内的旅行线路，domestic = 国内的！"},
185: {"simple":"dominate /ˈdɒmɪneɪt/ v.主导；支配。词根 domin-(主人)+ate→做主人→主导。","story":"这支球队 dominate 了联赛整整五年。教练说：\"We don't just win. We dominate. There's a difference.\"","mnemonic":"「dominate」谐音\"多米内特\" → 多米内特在比赛中完全主导了局面，dominate = 主导！"},
186: {"simple":"donate /dəʊˈneɪt/ v.捐赠。词根 don-(给予)+ate→给予→捐赠。同根词：donor(捐赠者)。","story":"他每月 donate 10% 工资给动物保护组织。朋友问他为什么，他说：\"Donating makes me feel rich in ways money can't.\"","mnemonic":"「donate」谐音\"兜内特\" → 兜内特慷慨捐赠了一笔助学基金，donate = 捐赠！"},
187: {"simple":"draft /drɑːft/ n.草稿 v.起草。源自 draw(拉/画)→拉出草图→草稿。","story":"他写论文总是先写一个 messy draft，再慢慢改。导师说：\"The first draft is just you telling yourself the story.\"","mnemonic":"「draft」谐音\"抓夫特\" → 抓夫特先打了个草稿再修改，draft = 草稿！"},
188: {"simple":"dramatic /drəˈmætɪk/ adj.戏剧性的；巨大的。词根 drama-(戏剧)+tic→如戏剧般的→戏剧性的。","story":"比分在最后三秒发生了 dramatic 的反转，全场观众都站了起来。解说员嗓子都喊哑了。","mnemonic":"「dramatic」谐音\"抓马提克\" → 剧情来个抓马提克的反转太戏剧性了，dramatic = 戏剧性的！"},
189: {"simple":"durable /ˈdjʊərəbl/ adj.耐用的。词根 dur-(坚硬/持久)+able→持久的→耐用的。","story":"奶奶的缝纫机用了五十年还像新的一样。她说：\"Things were built to be durable back then. People too.\"","mnemonic":"「durable」谐音\"丢瑞波\" → 丢瑞波的产品因极其耐用而出名，durable = 耐用的！"},
190: {"simple":"duration /djuˈreɪʃn/ n.持续时间。词根 dur-(持续)+ation→持续时间。","story":"航班延误的 duration 长达六小时，他用这时间读完了一整本书。\"A duration of waiting can be a gift if you use it right.\"","mnemonic":"「duration」谐音\"丢瑞神\" → 这次会议的丢瑞神持续了整整三个小时，duration = 持续时间！"},

# --- 191-200 ---
191: {"simple":"dynamic /daɪˈnæmɪk/ adj.动态的；充满活力的。词根 dynam-(力量/动力)+ic→有力量的→充满活力的。","story":"新来的实习生非常 dynamic，一周就融入团队还提了三个改进建议。老板说：\"We need more dynamic people like her.\"","mnemonic":"「dynamic」谐音\"戴纳米克\" → 戴纳米克的团队充满活力和动力，dynamic = 动态的/有活力的！"},
192: {"simple":"earthquake /ˈɜːθkweɪk/ n.地震。复合词：earth(大地)+quake(震动)→大地震动→地震。","story":"earthquake 发生时他在十楼，整个人跟着楼摇晃。后来他每到一个地方就先找安全出口——earthquake 教会了他未雨绸缪。","mnemonic":"「earthquake」谐音\"尔斯奎克\" → 尔斯奎克经历过一次大地震后变得格外警觉，earthquake = 地震！"},
193: {"simple":"economy /ɪˈkɒnəmi/ n.经济。源自希腊语 oikonomia(家务管理)。","story":"小镇的 economy 靠旅游业支撑。疫情时没人来，整个 economy 陷入停顿。现在游客又回来了，小店老板笑着说：\"Economy is like weather—unpredictable.\"","mnemonic":"「economy」谐音\"伊康诺米\" → 伊康诺米很关心全国的经济发展形势，economy = 经济！"},
194: {"simple":"edition /ɪˈdɪʃn/ n.版本。词根 edit-(编辑)+ion→编辑好的→版本。","story":"他收藏了一本 first edition 的《哈利波特》，据说价值上万。他说：\"First editions are like time machines to history.\"","mnemonic":"「edition」谐音\"伊迪神\" → 这是伊迪神的限量版珍藏书籍，edition = 版本！"},
195: {"simple":"elaborate /ɪˈlæbərət/ adj./v.精心制作的/详细阐述。词根 e-(出来)+labor(劳动)+ate→劳动出来的→精心制作的。","story":"他做了一个 elaborate 的求婚计划，租了热气球、请了乐队。结果突然下暴雨，两人在雨中狼狈地笑了——elaborate 不如简单真诚。","mnemonic":"「elaborate」谐音\"伊莱伯瑞特\" → 伊莱伯瑞特为婚礼做了精心详细的策划，elaborate = 精心制作的！"},
196: {"simple":"elect /ɪˈlekt/ v.选举。词根 e-(出来)+lect(选)→选出来→选举。","story":"全班 elect 他当班长，他发表就职演讲时说：\"You elected me because I talk the most in class, right?\" 全班爆笑。","mnemonic":"「elect」谐音\"伊莱克特\" → 伊莱克特被选举为新的学生会主席，elect = 选举！"},
197: {"simple":"element /ˈelɪmənt/ n.元素；要素。源自拉丁语 elementum(基本原理)。","story":"化学老师指着元素周期表说：\"Every element has its place. So do you in this world.\" 一句话让学生记了十年。","mnemonic":"「element」谐音\"艾利门特\" → 艾利门特找到了问题的关键要素，element = 元素/要素！"},
198: {"simple":"eliminate /ɪˈlɪmɪneɪt/ v.消除；淘汰。词根 e-(出去)+limin(门槛)+ate→赶出门槛→消除。","story":"球队在季后赛第一轮被 eliminate 了。教练说：\"Being eliminated is not the end. It's a lesson for next season.\"","mnemonic":"「eliminate」谐音\"伊利米内特\" → 伊利米内特成功消除了所有安全隐患，eliminate = 消除/淘汰！"},
199: {"simple":"embarrass /ɪmˈbærəs/ v.使尴尬。源自法语 embarrasser(阻碍)→使人不知所措→使尴尬。","story":"他在台上忘词了 embarrass 得满脸通红。观众却鼓起了掌——\"Embarrassment is universal. We've all been there.\"","mnemonic":"「embarrass」谐音\"恩拜瑞斯\" → 恩拜瑞斯在众人面前出了个丑非常尴尬，embarrass = 使尴尬！"},
200: {"simple":"embrace /ɪmˈbreɪs/ v.拥抱；拥抱(接受)。词根 em-(在…里)+brace(手臂)→在手臂里→拥抱。","story":"他 embrace 了人生中的所有失败，因为它们让他更强大。\"Embrace the struggle. It's sculpting you.\"","mnemonic":"「embrace」谐音\"恩布瑞斯\" → 恩布瑞斯热情地拥抱了每一个新机会，embrace = 拥抱！"},

# --- 201-210 ---
201: {"simple":"emerge /ɪˈmɜːdʒ/ v.出现；浮现。词根 e-(出来)+merge(沉入)→从沉入中出来→浮现。","story":"危机过后，新的领袖 emerge。历史学家说：\"Great leaders don't just appear. They emerge from great challenges.\"","mnemonic":"「emerge」谐音\"伊默治\" → 真相伊默治从迷雾中浮现出来了，emerge = 出现！"},
202: {"simple":"emphasis /ˈemfəsɪs/ n.强调；重点。词根 em-(在…里)+phas(展示)+is→在里面展示→强调。","story":"老师特别 emphasis 这个知识点要考，全班疯狂记笔记。结果考试只考了半分，老师说：\"Sometimes emphasis is overrated.\"","mnemonic":"「emphasis」谐音\"恩弗西斯\" → 恩弗西斯特别强调团队合作的重要性，emphasis = 强调！"},
203: {"simple":"employment /ɪmˈplɔɪmənt/ n.就业；雇佣。词根 em-(使)+ploy(折叠)+ment→使卷入工作中→雇佣。","story":"经济复苏后 employment rate 回升。找到工作的小伙子说：\"Employment is not just about money. It's about dignity.\"","mnemonic":"「employment」谐音\"恩普劳门特\" → 恩普劳门特终于找到了满意的就业岗位，employment = 就业！"},
204: {"simple":"enable /ɪˈneɪbl/ v.使能够。词根 en-(使)+able(能够)→使能够→enable。简洁又强大的词。","story":"学英语 enable 他看到了更大的世界。他说：\"English enabled me to connect with people I'd never have met otherwise.\"","mnemonic":"「enable」谐音\"伊内波\" → 这把钥匙伊内波打开通往成功的大门，enable = 使能够！"},
205: {"simple":"encounter /ɪnˈkaʊntər/ v./n.遇到；遭遇。词根 en-(使)+counter(对面/对抗)→使面对面→遇到。","story":"在火车上他 encounter 了一位有趣的老人，聊了整趟旅程。\"Best encounters are unplanned,\" 他后来和朋友说。","mnemonic":"「encounter」谐音\"恩康特尔\" → 恩康特尔在旅途中偶遇了多年未见的老友，encounter = 遇到！"},
206: {"simple":"engage /ɪnˈɡeɪdʒ/ v.从事；吸引；订婚。词根 en-(使)+gage(保证)→使做出保证→从事/订婚。","story":"好老师能让全班学生都 engage 在课堂里。校长的秘诀是：\"Engage their curiosity, and learning becomes unstoppable.\"","mnemonic":"「engage」谐音\"恩盖治\" → 恩盖治全情投入到了新项目的研发中，engage = 从事/吸引！"},
207: {"simple":"enormous /ɪˈnɔːməs/ adj.巨大的。词根 e-(超出)+norm(标准)+ous→超出标准的→巨大的。","story":"站在摩天大楼下他感受到了 enormous 的压迫感和震撼。\"Enormous things make you feel tiny, and that's strangely comforting.\"","mnemonic":"「enormous」谐音\"伊诺莫斯\" → 伊诺莫斯面临着一个巨大无比的机会，enormous = 巨大的！"},
208: {"simple":"ensure /ɪnˈʃʊər/ v.确保。词根 en-(使)+sure(确信)→使确信→确保。","story":"出门前他 check 了三次炉灶来 ensure 安全。室友笑他有强迫症，他说：\"Small checks ensure big safety.\"","mnemonic":"「ensure」谐音\"恩署尔\" → 恩署尔一定要确保所有流程都已完备，ensure = 确保！"},
209: {"simple":"enterprise /ˈentəpraɪz/ n.企业；事业。词根 enter-(在…之间)+prise(拿)→在其中拿主意→企业。","story":"他白手起家创办了一家 enterprise，员工从两个变成了两百个。\"An enterprise is not about buildings. It's about people with a shared dream.\"","mnemonic":"「enterprise」谐音\"恩特普莱斯\" → 恩特普莱斯创办了一家高科技企业，enterprise = 企业！"},
210: {"simple":"enthusiasm /ɪnˈθjuːziæzəm/ n.热情。源自希腊语 enthousiasmos(被神灵附体)→如痴如醉→热情。","story":"老师刚刚教这个班时充满 enthusiasm，每天激情满满的。半年后的她……嗯，enthusiasm 需要双方共同维护。","mnemonic":"「enthusiasm」谐音\"恩苏西亚怎\" → 恩苏西亚怎对工作充满了无限的热情，enthusiasm = 热情！"},

# --- 211-220 ---
211: {"simple":"environment /ɪnˈvaɪrənmənt/ n.环境。词根 en-(在…里)+viron(转/围绕)+ment→围绕在周围的东西→环境。","story":"搬家后新 environment 让他工作效率提升了一倍。\"Your environment shapes you more than you think,\" 他说。","mnemonic":"「environment」谐音\"恩外伦门特\" → 恩外伦门特非常注重保护自然环境，environment = 环境！"},
212: {"simple":"equip /ɪˈkwɪp/ v.装备。源自北欧语 skipa(配备船只)。equip with 装备有…。","story":"学校给每个学生 equip 了一台平板电脑。校长说：\"Equipping students with tools is easy. Equipping them with wisdom is the real challenge.\"","mnemonic":"「equip」谐音\"伊魁普\" → 伊魁普给每个队员都装备了最好的工具，equip = 装备！"},
213: {"simple":"equivalent /ɪˈkwɪvələnt/ adj./n.等价的/等价物。词根 equi-(相等的)+val(价值)+ent→等价值的→等价的。","story":"他说一句\"Thank you\" 的 equivalent 竟然比送礼物还有效。\"Sometimes words are the equivalent of gold.\"","mnemonic":"「equivalent」谐音\"伊魁沃伦特\" → 伊魁沃伦特的两个方案效果完全等价，equivalent = 等价的！"},
214: {"simple":"erode /ɪˈrəʊd/ v.侵蚀。词根 e-(去掉)+rode(咬)→咬掉→侵蚀。","story":"河水花了千年 erode 出了壮观的大峡谷。导游说：\"Erosion is slow but unstoppable. Like the passage of time.\"","mnemonic":"「erode」谐音\"伊柔德\" → 风雨伊柔德般慢慢侵蚀着古老的城墙，erode = 侵蚀！"},
215: {"simple":"essence /ˈesns/ n.本质；精华。词根 ess-(存在)+ence→存在的核心→本质。","story":"哲学家说生活的 essence 不是拥有多少，而是体验多少。\"The essence of life is in moments, not possessions.\"","mnemonic":"「essence」谐音\"艾森斯\" → 艾森斯一句话就说出了问题的本质，essence = 本质！"},
216: {"simple":"establish /ɪˈstæblɪʃ/ v.建立。词根 e-(加强)+stabl(稳定)+ish(动词尾)→使稳定→建立。","story":"他花了五年 establish 了一个公益组织，现在每年帮助上千个孩子。\"Establishing something meaningful takes time. There's no shortcut.\"","mnemonic":"「establish」谐音\"伊斯泰布利西\" → 伊斯泰布利西成功建立了一套完整的管理体系，establish = 建立！"},
217: {"simple":"estate /ɪˈsteɪt/ n.地产；庄园。源自拉丁语 status(状态/地位)。real estate 房地产。","story":"爷爷留下了一座 estate，但他觉得最好的 estate 不是房子而是爷爷讲过的那些故事。","mnemonic":"「estate」谐音\"伊斯泰特\" → 伊斯泰特继承了一座巨大的庄园，estate = 地产/庄园！"},
218: {"simple":"estimate /ˈestɪmeɪt/ v./n.估计。词根 estim-(价值)+ate→估价→估计。","story":"包工头 estimate 装修要花五万，最后花了十万。他说：\"Always double the initial estimate. That's renovation rule number one.\"","mnemonic":"「estimate」谐音\"艾斯提米特\" → 艾斯提米特估计工期大概需要两周，estimate = 估计！"},
219: {"simple":"evaluate /ɪˈvæljueɪt/ v.评估。词根 e-(出来)+valu(价值)+ate→把价值算出来→评估。","story":"面试官需要 evaluate 200 份简历，一天时间。他说：\"Evaluating people on paper is one of the hardest things I do.\"","mnemonic":"「evaluate」谐音\"伊瓦流特\" → 伊瓦流特需要评估这个项目的可行性，evaluate = 评估！"},
220: {"simple":"eventually /ɪˈventʃuəli/ adv.最终；终于。词根 e-(出来)+vent(来)+ually→最终会来的→最终。","story":"失败了一百次后，他 eventually 成功了。记者问秘诀，他说：\"Eventually is just another word for not giving up.\"","mnemonic":"「eventually」谐音\"伊文丑利\" → 伊文丑利终于完成了这场马拉松，eventually = 最终！"},

# --- 221-230 ---
221: {"simple":"evidence /ˈevɪdəns/ n.证据。词根 e-(出来)+vid(看)+ence→看出来的东西→证据。","story":"侦探说没有 evidence 不能抓人，但他直觉告诉他是那个人。果然在最后关头找到了关键 evidence。","mnemonic":"「evidence」谐音\"艾维登斯\" → 艾维登斯找到了决定性的证据来支撑论据，evidence = 证据！"},
222: {"simple":"evolve /ɪˈvɒlv/ v.进化；演变。词根 e-(向外)+volve(转)→向外转展开→进化。","story":"看着十年前的自己，他惊讶于自己 evolve 了多少。\"People evolve. That's why you shouldn't judge someone by their past.\"","mnemonic":"「evolve」谐音\"伊沃尔夫\" → 伊沃尔夫见证了公司从初创到进化为巨头的全过程，evolve = 进化！"},
223: {"simple":"exceed /ɪkˈsiːd/ v.超过。词根 ex-(超出)+ceed(走)→走出去→超过。","story":"他的成绩 exceed 了所有人的预期——包括他自己。老师说：\"Exceeding expectations starts with exceeding your own limits.\"","mnemonic":"「exceed」谐音\"伊克西德\" → 伊克西德的成就远远超过了同龄人，exceed = 超过！"},
224: {"simple":"exception /ɪkˈsepʃn/ n.例外。词根 ex-(出来)+cept(拿)+ion→拿出来→例外。","story":"规则是规则，但每个规则都有一个 exception。他说：\"The exception doesn't break the rule. It proves the rule exists.\"","mnemonic":"「exception」谐音\"伊克塞普神\" → 伊克塞普神说他可以破例一次，exception = 例外！"},
225: {"simple":"exclude /ɪkˈskluːd/ v.排除。词根 ex-(向外)+clude(关)→关门把…排除在外→排除。","story":"参加聚会时发现自己的名字被 exclude 了，很难过。好朋友拉着他另开了一场更嗨的 party：\"Being excluded from one door opens another.\"","mnemonic":"「exclude」谐音\"伊克斯克鲁德\" → 伊克斯克鲁德被排除在了邀请名单之外，exclude = 排除！"},
226: {"simple":"exclusive /ɪkˈskluːsɪv/ adj.独有的；排外的。词根 ex-(向外)+clus(关)+ive→关在外面的→独有的。","story":"这家餐厅是会员 exclusive 的，普通人进不去。他站在门口自嘲：\"Exclusivity is just a fancy word for keeping people out.\"","mnemonic":"「exclusive」谐音\"伊克思科鲁西夫\" → 这个是伊克思科鲁西夫的独家新闻报道，exclusive = 独有的！"},
227: {"simple":"execute /ˈeksɪkjuːt/ v.执行；处决。词根 ex-(出来)+(s)ecute(跟随)→跟着出来执行→执行。","story":"有了好计划关键在 execute。CEO 说：\"Ideas are cheap. Execution is everything.\"","mnemonic":"「execute」谐音\"艾克西克特\" → 艾克西克特高效地执行了董事会决议，execute = 执行！"},
228: {"simple":"exert /ɪɡˈzɜːt/ v.施加；发挥。词根 ex-(出来)+ert(放)→放出来→施加。","story":"他 exert 了全部精力在这个项目上，连续三个月每天只睡五小时。\"You have to exert yourself to achieve greatness.\"","mnemonic":"「exert」谐音\"伊格泽特\" → 伊格泽特对团队施加了不小的压力，exert = 施加/发挥！"},
229: {"simple":"exhibit /ɪɡˈzɪbɪt/ v.展览 n.展品。词根 ex-(出来)+hibit(持)→拿出来→展示。","story":"他的画第一次被美术馆 exhibit 时，他站在画前哭了。\"Exhibiting your work is like showing your soul to strangers.\"","mnemonic":"「exhibit」谐音\"伊格泽比特\" → 伊格泽比特的作品在艺术馆展出了，exhibit = 展览！"},
230: {"simple":"expand /ɪkˈspænd/ v.扩张；扩展。词根 ex-(向外)+pand(展开)→向外展开→扩张。","story":"公司从三个人的车库 expand 到三百人的大楼。创始人说：\"Expand your vision before you expand your office.\"","mnemonic":"「expand」谐音\"伊克斯潘德\" → 伊克斯潘德计划将业务扩展到海外市场，expand = 扩张！"},

# --- 231-235 ---
231: {"simple":"expect /ɪkˈspekt/ v.期望；预期。词根 ex-(向外)+pect(看)→向外看→期望。","story":"妈妈 expect 他考 100 分，他考了 99。\"I exceeded your expectations,\" 他说。\"No,\" 妈妈笑，\"I always expect the best from you.\"","mnemonic":"「expect」谐音\"伊克斯佩克特\" → 伊克斯佩克特对团队有着很高的期望，expect = 期望！"},
232: {"simple":"expense /ɪkˈspens/ n.费用。词根 ex-(向外)+pense(支付)→向外支付→费用。","story":"留学的 expense 超出了预算，他打三份工。\"Every expense is an investment in my future,\" 他这样安慰自己。","mnemonic":"「expense」谐音\"伊克斯彭斯\" → 伊克斯彭斯需要控制每月的开销费用，expense = 费用！"},
233: {"simple":"exploit /ɪkˈsplɔɪt/ v.开发；剥削 n.功绩。词根 ex-(出来)+ploit(折叠)→把折叠的打开→开发。","story":"黑客发现了系统漏洞并 exploit 了它，结果被公司招安成了安全顾问。\"Sometimes exploiting a weakness gets you a job.\"","mnemonic":"「exploit」谐音\"伊克斯普劳特\" → 伊克斯普劳特成功开发了地下矿产资源，exploit = 开发！"},
234: {"simple":"export /ɪkˈspɔːt/ v./n.出口。词根 ex-(向外)+port(搬运)→向外搬运→出口。对比 import(进口)。","story":"这个小镇的瓷器 export 到全球五十多个国家。老匠人摸着作品说：\"Each piece we export carries a piece of our culture.\"","mnemonic":"「export」谐音\"伊克斯伯特\" → 伊克斯伯特的产品出口到世界各地，export = 出口！"},
235: {"simple":"external /ɪkˈstɜːnl/ adj.外部的。词根 extern-(外面)+al→外部的。对比 internal(内部的)。","story":"他看起来成功，但 external 的光鲜掩盖不了内心的空虚。心理医生说：\"Fix the internal, and external will follow.\"","mnemonic":"「external」谐音\"伊克斯特诺\" → 伊克斯特诺的影响来自外部环境而非自身，external = 外部的！"},

}
