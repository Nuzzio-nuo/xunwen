export type PatternKnowledge = {
  id: string;
  name: string;
  aliases: string[];
  era: string;
  technique: string;
  symbolism: string;
  story: string;
  designTips: string;
  image: string;
};

export const PATTERN_KNOWLEDGE_BASE: PatternKnowledge[] = [
  {
    id: "song-kesi-luanque",
    name: "宋·缂丝紫鸾鹊纹",
    aliases: ["缂丝紫鸾鹊纹", "鸾鹊纹", "紫鸾鹊纹"],
    era: "宋代",
    technique: "缂丝",
    symbolism: "寓意鸾凤和鸣、喜事相连，常用于礼制与吉庆语境。",
    story: "宋代缂丝讲究通经断纬，能表现细密层次。鸾鸟与喜鹊组合形成喜庆叙事，体现宋人雅致审美。",
    designTips: "适合婚庆、礼赠和文化展陈视觉，可用紫金、绛红、米白做主色，突出典雅气质。",
    image: "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?w=400&q=80"
  },
  {
    id: "ming-qinghua-lian",
    name: "明·青花缠枝莲纹",
    aliases: ["青花缠枝莲纹", "缠枝莲纹", "青花莲纹"],
    era: "明代",
    technique: "青花",
    symbolism: "象征连绵不断、生生不息，也常引申为家族兴旺与福泽延续。",
    story: "缠枝莲在明代器物装饰中广泛使用，以枝蔓连缀形成秩序与节奏，是典型的东方连续纹样。",
    designTips: "适合器皿包装、品牌边框和文创图案，蓝白对比清晰，可与留白结合提升现代感。",
    image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&q=80"
  },
  {
    id: "qing-yunjin-long",
    name: "清·云锦团龙纹",
    aliases: ["云锦团龙纹", "团龙纹", "龙纹"],
    era: "清代",
    technique: "云锦",
    symbolism: "代表权威、吉祥和守护力量，常用于礼制与尊贵场景。",
    story: "云锦织造工艺复杂，色彩富丽，团龙布局强调中心秩序，反映传统礼制文化。",
    designTips: "适合高端礼盒、典礼装置与主视觉中心图，可用金线质感和深色底强化仪式感。",
    image: "https://images.unsplash.com/photo-1526404783904-8828f5349228?w=400&q=80"
  },
  {
    id: "miao-butterfly-mother",
    name: "苗族蝴蝶妈妈纹",
    aliases: ["蝴蝶妈妈", "苗族蝴蝶纹", "蝴蝶纹"],
    era: "民族传承",
    technique: "苗绣 / 蜡染",
    symbolism: "象征生命起源与万物繁衍，是族群记忆和母性叙事的重要符号。",
    story: "蝴蝶妈妈神话在苗族文化中具有源流地位，相关纹样常通过刺绣、蜡染在服饰中代际传承。",
    designTips: "适合教育展览、亲子文创、文化科普内容，建议保留手作质感与对称构图。",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80"
  },
  {
    id: "qinghua-hailang",
    name: "青花海水江崖纹",
    aliases: ["海水江崖纹", "江崖海水纹", "海水纹"],
    era: "明清",
    technique: "青花 / 宫廷织绣",
    symbolism: "寓意山河永固、国泰民安，常见于礼服、器物和宫廷陈设。",
    story: "海水江崖纹以波涛与山崖组合，形成下托上承的稳定结构，在礼制图像中有重要地位。",
    designTips: "适合品牌主视觉底纹、礼盒腰封或证书底图，建议使用层叠波线增强纵深感。",
    image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400&q=80"
  },
  {
    id: "ruyi-cloud",
    name: "如意云纹",
    aliases: ["如意云", "云头纹", "祥云纹"],
    era: "汉至清",
    technique: "木雕 / 漆器 / 织绣",
    symbolism: "象征吉祥如意、福气流转，是最常见的传统吉祥纹样之一。",
    story: "如意云纹由卷云演变而来，线条回旋流动，兼具装饰性与祈福意义。",
    designTips: "适合做页面分隔、边框和背景暗纹，可用低对比度叠加提升东方气质。",
    image: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&q=80"
  },
  {
    id: "taotie",
    name: "饕餮纹",
    aliases: ["兽面纹", "青铜兽面纹"],
    era: "商周",
    technique: "青铜铸造",
    symbolism: "象征威严、神秘与祭祀秩序，强调礼制权威。",
    story: "饕餮纹是中国青铜时代最具识别度的装饰纹之一，通常以对称兽面呈现。",
    designTips: "适合博物馆文创、硬朗风格品牌和纪念章图案，线条宜厚重有棱角。",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&q=80"
  },
  {
    id: "leiwen",
    name: "雷纹",
    aliases: ["回纹雷纹", "方折回纹", "雷回纹"],
    era: "商周至汉",
    technique: "青铜 / 漆器 / 陶瓷",
    symbolism: "象征秩序与循环，常用于衬地和边饰。",
    story: "雷纹由连续方折线组成，节奏紧密，是传统器物上最典型的几何纹饰之一。",
    designTips: "适合做边框、底纹与信息区分割，建议使用重复阵列保证整体统一。",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&q=80"
  },
  {
    id: "baoxianghua",
    name: "宝相花纹",
    aliases: ["宝相花", "团花纹", "唐式团花"],
    era: "隋唐",
    technique: "织锦 / 壁画 / 金银器",
    symbolism: "寓意富贵圆满、华美庄严，常见于佛教与宫廷艺术。",
    story: "宝相花融合莲花、牡丹等花形特征，形成理想化的复合花纹，兼具宗教与世俗审美。",
    designTips: "适合节庆海报与礼品包装，中心对称布局更能体现庄重感。",
    image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=400&q=80"
  },
  {
    id: "gourdbutterfly",
    name: "葫芦蝶纹",
    aliases: ["福禄蝶纹", "蝶恋葫芦纹"],
    era: "明清民间",
    technique: "剪纸 / 木版年画 / 刺绣",
    symbolism: "“葫芦”谐音“福禄”，“蝶”谐音“耋”，寓意福禄长寿。",
    story: "葫芦蝶纹常出现在年画与婚嫁用品中，通过谐音构成民俗吉语体系。",
    designTips: "适合节日礼品与家庭场景文创，配色可用暖红与金黄增强喜庆感。",
    image: "https://images.unsplash.com/photo-1602515763578-7f5ecf3f7720?w=400&q=80"
  },
  {
    id: "shouzi",
    name: "寿字纹",
    aliases: ["团寿纹", "百寿纹", "寿纹"],
    era: "明清",
    technique: "织绣 / 瓷器 / 建筑彩画",
    symbolism: "象征健康长寿、福寿延年，是祝寿题材核心纹样。",
    story: "寿字纹通过篆隶楷等书体演化形成多种装饰构成，常与蝙蝠、桃纹组合。",
    designTips: "适合长辈礼品、康养品牌和节令活动视觉，可使用圆形构图增强稳定感。",
    image: "https://images.unsplash.com/photo-1455849318743-b2233052fcff?w=400&q=80"
  },
  {
    id: "dragonphoenix",
    name: "龙凤纹",
    aliases: ["龙凤呈祥", "凤龙纹", "龙凤呈瑞"],
    era: "汉至清",
    technique: "织锦 / 金银器 / 建筑装饰",
    symbolism: "寓意阴阳和合、吉庆祥瑞，常见于婚礼及庆典场景。",
    story: "龙凤纹历代沿用，构图上常以双主体对舞或环绕团花，强调祥瑞叙事。",
    designTips: "适合婚礼主题视觉、典礼用品和纪念装置，建议突出中轴对称与动势。",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80"
  },
  {
    id: "fishlotus",
    name: "鱼莲纹",
    aliases: ["连年有余纹", "鱼戏莲纹", "莲鱼纹"],
    era: "宋至清民间",
    technique: "年画 / 刺绣 / 陶瓷",
    symbolism: "“鱼”谐音“余”，“莲”谐音“连”，寓意连年有余。",
    story: "鱼莲纹在民间年画和织绣中常见，题材亲和、寓意明确，传播范围广。",
    designTips: "适合新春主题、家庭礼赠与儿童科普设计，构图可偏圆润以增强亲和感。",
    image: "https://images.unsplash.com/photo-1517685352821-92cf88aee5a5?w=400&q=80"
  },
  {
    id: "gba-lion-scale-cloud",
    name: "广府醒狮鳞甲云纹",
    aliases: ["醒狮鳞甲纹", "广府醒狮纹", "狮头云纹"],
    era: "清末至今",
    technique: "醒狮扎作",
    symbolism: "寓意辟邪纳福、勇毅进取，是岭南节庆中高识别度吉祥符号。",
    story: "广府醒狮在狮头彩扎中常结合鳞甲、卷云和火焰纹，视觉上强调力量与动势。",
    designTips: "适合节庆活动主视觉、运动赛事和品牌IP延展，建议用高饱和红黄并强化对比边线。",
    image: "https://images.unsplash.com/photo-1549144511-f099e773c147?w=400&q=80"
  },
  {
    id: "foshan-newyear-guardian",
    name: "佛山木版年画门神纹",
    aliases: ["佛山门神纹", "木版门神纹", "佛山年画纹"],
    era: "明清至今",
    technique: "佛山木版年画",
    symbolism: "象征镇宅平安、护佑家门，承载民间祈福与伦理秩序。",
    story: "佛山木版年画是岭南重要年俗图像系统，门神题材以甲胄和兵器纹构成威严叙事。",
    designTips: "适合春节包装、祈福海报与文博文创，可通过版刻质感与套色叠印强化传统风格。",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=80"
  },
  {
    id: "foshan-papercut-magpie-plum",
    name: "佛山剪纸喜鹊登梅纹",
    aliases: ["喜鹊登梅纹", "佛山剪纸喜纹", "登梅喜鹊纹"],
    era: "清代至今",
    technique: "佛山剪纸",
    symbolism: "寓意喜上眉梢、报春纳吉，常用于婚喜与节庆装饰。",
    story: "佛山剪纸善用阴阳刻与对称构图，喜鹊登梅题材兼具叙事性和吉语表达。",
    designTips: "适合贺卡、婚礼视觉与窗贴产品，建议保持镂空层次和边框连续性。",
    image: "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=400&q=80"
  },
  {
    id: "guangxiu-phoenix-peony",
    name: "广绣凤凰牡丹纹",
    aliases: ["广绣凤凰纹", "凤凰牡丹纹", "粤绣凤凰纹"],
    era: "清代至今",
    technique: "广绣",
    symbolism: "寓意富贵荣华、祥和美满，是岭南礼仪与喜庆场景常见纹样。",
    story: "广绣擅长金线、孔雀羽线等材料表现，凤凰牡丹构图强调华丽和尊贵气质。",
    designTips: "适合礼盒、服饰刺绣与高端伴手礼视觉，建议突出金线高光与花羽层次。",
    image: "https://images.unsplash.com/photo-1526404783904-8828f5349228?w=400&q=80"
  },
  {
    id: "chaoxiu-gold-dragon",
    name: "潮绣金银线蟠龙纹",
    aliases: ["潮绣蟠龙纹", "金银线龙纹", "潮绣龙纹"],
    era: "清代至今",
    technique: "潮绣",
    symbolism: "象征祥瑞权威与家族荣耀，常用于庆典戏服和礼仪陈设。",
    story: "潮绣以立体垫绣和金银线见长，蟠龙纹样在空间层次和光泽表达上极具辨识度。",
    designTips: "适合舞台服饰、庆典装置和展陈主图，建议以深色底衬托金属线质感。",
    image: "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?w=400&q=80"
  },
  {
    id: "chaozhou-woodcarving-bogu",
    name: "潮州木雕金漆博古纹",
    aliases: ["潮州博古纹", "金漆木雕纹", "潮州木雕博古"],
    era: "明清至今",
    technique: "潮州木雕",
    symbolism: "寓意崇文尚雅、家道昌隆，体现岭南宗祠文化记忆。",
    story: "潮州木雕常以金漆和深浮雕呈现博古器物题材，构图繁密且秩序严谨。",
    designTips: "适合文化空间导视、展馆边框和高端包装，可用层叠阴影模拟雕刻纵深。",
    image: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&q=80"
  },
  {
    id: "chaozhou-inlay-beast",
    name: "潮州嵌瓷剪黏瑞兽纹",
    aliases: ["潮州嵌瓷纹", "剪黏瑞兽纹", "屋脊瑞兽纹"],
    era: "清末至今",
    technique: "潮州嵌瓷",
    symbolism: "寓意镇宅护佑、吉祥纳福，是潮汕祠庙建筑的重要视觉符号。",
    story: "潮州嵌瓷以瓷片拼贴屋脊人物和瑞兽，色彩强烈、体量夸张，形成独特地方风貌。",
    designTips: "适合城市文旅视觉和IP造型，建议用高对比块面与轮廓线强化拼贴感。",
    image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=400&q=80"
  },
  {
    id: "xiangyunsha-hex-geom",
    name: "香云纱龟背几何纹",
    aliases: ["香云纱龟背纹", "顺德香云纱纹", "龟背几何纹"],
    era: "清代至今",
    technique: "香云纱染整",
    symbolism: "象征稳固长久与生活秩序，体现岭南日用审美中的克制之美。",
    story: "香云纱工艺以植物染与河泥整理形成独特色泽，几何纹在服饰中常作秩序化表达。",
    designTips: "适合服饰面料、家居软装和简雅品牌视觉，建议采用低饱和土色系。",
    image: "https://images.unsplash.com/photo-1461709444300-a6217f29367b?w=400&q=80"
  },
  {
    id: "guangcai-flower-panel",
    name: "广彩开光折枝花卉纹",
    aliases: ["广彩折枝纹", "开光花卉纹", "广州彩瓷花纹"],
    era: "清代",
    technique: "广彩瓷",
    symbolism: "寓意繁荣昌盛与生活丰美，体现外销瓷时代的岭南审美融合。",
    story: "广彩在开光构图中常以折枝花卉作主体，结合描金边饰形成精致装饰体系。",
    designTips: "适合餐饮品牌器皿、礼品包装和图案资产库，可用线框开光提升识别度。",
    image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&q=80"
  },
  {
    id: "shiwan-lion-mask",
    name: "石湾陶塑狮面纹",
    aliases: ["石湾狮面纹", "陶塑狮纹", "佛山石湾纹"],
    era: "明清至今",
    technique: "石湾陶塑",
    symbolism: "象征护佑家宅与兴旺安康，是岭南民间信俗常见图形语言。",
    story: "石湾陶塑以写实与夸张并用著称，狮面纹常与卷草纹组合用于门饰与摆件。",
    designTips: "适合文旅纪念品和空间陈设元素，建议保留釉色层次与粗粝手作感。",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&q=80"
  },
  {
    id: "duanyan-kuilong-banana",
    name: "肇庆端砚蕉叶夔龙纹",
    aliases: ["端砚夔龙纹", "蕉叶纹端砚", "肇庆端砚纹"],
    era: "宋至今",
    technique: "端砚雕刻",
    symbolism: "寓意文脉绵延、守正进取，是岭南文人传统的象征性纹样。",
    story: "端砚雕刻结合石品天然纹理，蕉叶与夔龙题材常用于文房器物装饰。",
    designTips: "适合文化礼赠、教育品牌和书院视觉，建议以深灰与黛青呈现文雅气质。",
    image: "https://images.unsplash.com/photo-1455849318743-b2233052fcff?w=400&q=80"
  },
  {
    id: "xinhui-palm-weave",
    name: "新会葵艺葵叶回纹",
    aliases: ["葵艺回纹", "新会葵叶纹", "葵编几何纹"],
    era: "清代至今",
    technique: "新会葵艺",
    symbolism: "象征勤作丰收与家业兴旺，反映岭南手工日用文化。",
    story: "新会葵艺以葵叶编织见长，回纹和放射纹在扇面与器用中形成秩序美。",
    designTips: "适合家居、收纳和夏季文创，建议用重复模块构建轻量化图案系统。",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&q=80"
  },
  {
    id: "hakka-encircled-star",
    name: "客家围屋八角星纹",
    aliases: ["围屋八角纹", "客家星纹", "八角护佑纹"],
    era: "明清至近现代",
    technique: "客家建筑装饰",
    symbolism: "寓意聚合守望、家族团结与平安护佑。",
    story: "客家围屋装饰中常见几何护佑纹，八角星样式兼具结构秩序与象征意义。",
    designTips: "适合建筑导视、社区形象和公共文化视觉，建议采用中轴与网格化布局。",
    image: "https://images.unsplash.com/photo-1495837174058-628aafc7d610?w=400&q=80"
  },
  {
    id: "meizhou-indigo-leaf",
    name: "梅州客家蓝染草叶纹",
    aliases: ["客家蓝染纹", "蓝染草叶纹", "梅州蓝染纹"],
    era: "近现代传承",
    technique: "客家蓝染",
    symbolism: "象征朴素坚韧与自然共生，是客家生活美学的重要表达。",
    story: "客家蓝染以草木染色和简洁纹样见长，草叶连续纹常见于日用纺织品。",
    designTips: "适合服装、家纺和可持续品牌，建议使用蓝白对比与留白节奏。",
    image: "https://images.unsplash.com/photo-1517685352821-92cf88aee5a5?w=400&q=80"
  },
  {
    id: "dongguan-lotus-lamp",
    name: "东莞千角灯莲花云纹",
    aliases: ["千角灯莲花纹", "东莞灯彩纹", "莲花云纹"],
    era: "明清至今",
    technique: "千角灯扎作",
    symbolism: "寓意光明团圆、福泽绵延，常用于节庆巡游与祈福场景。",
    story: "千角灯装饰融合灯彩结构与吉祥纹样，莲花云纹在层叠构图中极具节庆氛围。",
    designTips: "适合夜游活动、节庆海报与数字装置，建议使用发光渐变提升仪式感。",
    image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400&q=80"
  },
  {
    id: "zhongshan-wave-pattern",
    name: "中山咸水歌波浪回纹",
    aliases: ["咸水歌波浪纹", "中山水乡回纹", "珠江口海浪纹"],
    era: "近现代民俗",
    technique: "民俗纹样转译",
    symbolism: "象征舟楫往来、生计繁荣与水乡共同体记忆。",
    story: "咸水歌是珠江口重要民间口头传统，其视觉转译常借助波浪回纹表达地域文化特征。",
    designTips: "适合文旅导览和城市品牌辅助图案，建议采用连续曲线形成流动节奏。",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80"
  },
  {
    id: "hongkong-floral-board-shou",
    name: "香港花牌金箔团寿纹",
    aliases: ["香港花牌纹", "团寿花牌纹", "港式花牌纹"],
    era: "近现代至今",
    technique: "花牌扎作",
    symbolism: "寓意长寿吉庆、社群和合，是香港传统节庆视觉标识之一。",
    story: "香港花牌工艺融合书法、扎作与金箔装饰，团寿纹在庆典语境中使用频繁。",
    designTips: "适合活动门楼、庆典KV和城市节事视觉，建议保留立体层叠与金箔点缀。",
    image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=400&q=80"
  },
  {
    id: "hongkong-neon-cloudlei",
    name: "港式霓虹书法云雷纹",
    aliases: ["港式霓虹纹", "书法云雷纹", "香港招牌纹"],
    era: "20世纪至今",
    technique: "手写招牌工艺",
    symbolism: "象征城市活力与在地记忆，体现传统纹样与现代商业美学融合。",
    story: "港式手写招牌在霓虹时代形成独特视觉文化，云雷边饰常用于增强识别度与节奏感。",
    designTips: "适合夜经济品牌和城市文创，建议用高对比霓虹色并控制笔画粗细。",
    image: "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=400&q=80"
  },
  {
    id: "macao-bluegrass",
    name: "澳门土生葡韵青花卷草纹",
    aliases: ["澳门卷草纹", "葡韵青花纹", "土生葡人装饰纹"],
    era: "明清至近现代",
    technique: "建筑与器物装饰",
    symbolism: "象征海洋交流与文化交融，体现澳门多元历史语境。",
    story: "澳门历史建筑与器物装饰中常见卷草与青花语汇并置，呈现中西纹样共生特征。",
    designTips: "适合文化路线导视、城市伴手礼和空间软装，可用蓝白基调体现地域识别。",
    image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&q=80"
  },
  {
    id: "macao-shield-wave",
    name: "澳门龙环葡韵海浪盾徽纹",
    aliases: ["澳门海浪盾徽纹", "龙环葡韵纹", "葡韵盾纹"],
    era: "近现代",
    technique: "城市装饰纹样",
    symbolism: "寓意守护与航海精神，体现澳门滨海城市文化特征。",
    story: "澳门近现代装饰图像中，海浪与盾徽的并置常用于公共空间与纪念性设计。",
    designTips: "适合文旅导览系统和城市纪念周边，建议采用徽章化构图提升识别性。",
    image: "https://images.unsplash.com/photo-1578920537680-0c2735228c44?w=400&q=80"
  }
];

export const findPatternKnowledge = (text: string): PatternKnowledge | null => {
  const content = text.toLowerCase();
  for (const item of PATTERN_KNOWLEDGE_BASE) {
    const candidates = [item.name, ...item.aliases];
    if (candidates.some((k) => content.includes(k.toLowerCase()))) {
      return item;
    }
  }
  return null;
};

