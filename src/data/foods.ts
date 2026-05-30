/**
 * foods.ts — 常见中式食物库（离线可用）
 *
 * 约 200 种中式常见食物，按分类组织。
 * 每条记录包含每 100g 的营养数据。
 *
 * 修改入口:
 *   - 新增食物：在对应分类数组中添加对象
 *   - 修改数据：直接改各字段数值
 *   - 数据来源参考: 中国食物成分表(第6版)
 */

export interface FoodItem {
  name: string
  category: string
  calories: number // kcal / 100g
  protein: number  // g
  fat: number      // g
  carbs: number    // g
  portion?: string // 常见份量
}

export const FOOD_CATEGORIES = [
  '主食',
  '肉类',
  '蔬菜',
  '水果',
  '蛋奶',
  '豆类',
  '水产',
  '小吃',
  '饮品',
  '调味',
] as const

export const FOODS: FoodItem[] = [
  // ═══ 主食 ═══
  { name: '白米饭', category: '主食', calories: 116, protein: 2.6, fat: 0.3, carbs: 25.9, portion: '1碗≈150g' },
  { name: '馒头', category: '主食', calories: 223, protein: 7.0, fat: 1.1, carbs: 44.2, portion: '1个≈100g' },
  { name: '面条(煮)', category: '主食', calories: 110, protein: 3.5, fat: 0.3, carbs: 23.0, portion: '1碗≈250g' },
  { name: '花卷', category: '主食', calories: 211, protein: 6.4, fat: 1.0, carbs: 42.0, portion: '1个≈90g' },
  { name: '小米粥', category: '主食', calories: 46, protein: 1.4, fat: 0.7, carbs: 8.4, portion: '1碗≈250g' },
  { name: '白粥', category: '主食', calories: 30, protein: 0.6, fat: 0.1, carbs: 6.6, portion: '1碗≈250g' },
  { name: '油条', category: '主食', calories: 386, protein: 6.9, fat: 22.0, carbs: 36.0, portion: '1根≈70g' },
  { name: '包子(肉)', category: '主食', calories: 227, protein: 9.0, fat: 8.0, carbs: 28.0, portion: '1个≈100g' },
  { name: '饺子(煮)', category: '主食', calories: 188, protein: 7.0, fat: 6.0, carbs: 25.0, portion: '10个≈200g' },
  { name: '馄饨', category: '主食', calories: 174, protein: 6.5, fat: 5.0, carbs: 24.0, portion: '10个≈200g' },
  { name: '烧饼', category: '主食', calories: 326, protein: 8.2, fat: 10.0, carbs: 45.0, portion: '1个≈100g' },
  { name: '全麦面包', category: '主食', calories: 246, protein: 8.5, fat: 3.4, carbs: 43.0, portion: '2片≈60g' },
  { name: '白吐司', category: '主食', calories: 278, protein: 8.0, fat: 3.0, carbs: 51.0, portion: '2片≈60g' },
  { name: '红薯', category: '主食', calories: 86, protein: 1.6, fat: 0.1, carbs: 20.1, portion: '1个≈200g' },
  { name: '玉米', category: '主食', calories: 112, protein: 4.0, fat: 1.2, carbs: 22.8, portion: '1根≈200g' },
  { name: '土豆', category: '主食', calories: 76, protein: 2.0, fat: 0.2, carbs: 17.2, portion: '1个≈150g' },
  { name: '山药', category: '主食', calories: 57, protein: 1.9, fat: 0.2, carbs: 12.4, portion: '100g' },
  { name: '紫薯', category: '主食', calories: 82, protein: 1.5, fat: 0.1, carbs: 18.5, portion: '1个≈200g' },
  { name: '燕麦片', category: '主食', calories: 367, protein: 13.5, fat: 6.7, carbs: 61.6, portion: '1碗≈40g' },
  { name: '糯米饭', category: '主食', calories: 120, protein: 2.4, fat: 0.3, carbs: 26.0, portion: '100g' },

  // ═══ 肉类 ═══
  { name: '鸡胸肉', category: '肉类', calories: 133, protein: 31.0, fat: 1.2, carbs: 0, portion: '1块≈150g' },
  { name: '鸡腿肉', category: '肉类', calories: 181, protein: 25.0, fat: 8.0, carbs: 0, portion: '1个≈150g' },
  { name: '鸡翅', category: '肉类', calories: 194, protein: 18.0, fat: 12.0, carbs: 0, portion: '3个≈100g' },
  { name: '猪瘦肉', category: '肉类', calories: 143, protein: 20.3, fat: 6.2, carbs: 1.0, portion: '100g' },
  { name: '猪排骨', category: '肉类', calories: 264, protein: 18.0, fat: 20.0, carbs: 0, portion: '100g' },
  { name: '猪五花肉', category: '肉类', calories: 518, protein: 9.0, fat: 53.0, carbs: 0, portion: '100g' },
  { name: '猪蹄', category: '肉类', calories: 260, protein: 22.0, fat: 18.0, carbs: 0, portion: '100g' },
  { name: '牛肉(瘦)', category: '肉类', calories: 106, protein: 20.2, fat: 2.3, carbs: 1.2, portion: '100g' },
  { name: '牛腩', category: '肉类', calories: 203, protein: 17.0, fat: 14.0, carbs: 0, portion: '100g' },
  { name: '牛腱子', category: '肉类', calories: 123, protein: 22.0, fat: 3.0, carbs: 0, portion: '100g' },
  { name: '羊肉(瘦)', category: '肉类', calories: 118, protein: 20.5, fat: 3.9, carbs: 0, portion: '100g' },
  { name: '羊排', category: '肉类', calories: 253, protein: 16.0, fat: 20.0, carbs: 0, portion: '100g' },
  { name: '鸭肉', category: '肉类', calories: 240, protein: 15.5, fat: 19.7, carbs: 0, portion: '100g' },
  { name: '腊肉', category: '肉类', calories: 498, protein: 15.0, fat: 48.0, carbs: 2.0, portion: '100g' },
  { name: '火腿肠', category: '肉类', calories: 212, protein: 12.0, fat: 15.0, carbs: 5.0, portion: '1根≈50g' },
  { name: '培根', category: '肉类', calories: 458, protein: 12.0, fat: 45.0, carbs: 1.0, portion: '2片≈30g' },
  { name: '牛肉干', category: '肉类', calories: 325, protein: 55.0, fat: 8.0, carbs: 5.0, portion: '100g' },
  { name: '香肠', category: '肉类', calories: 301, protein: 13.0, fat: 26.0, carbs: 3.0, portion: '1根≈50g' },

  // ═══ 蔬菜 ═══
  { name: '大白菜', category: '蔬菜', calories: 13, protein: 1.5, fat: 0.2, carbs: 2.2, portion: '100g' },
  { name: '小白菜', category: '蔬菜', calories: 15, protein: 1.5, fat: 0.3, carbs: 2.7, portion: '100g' },
  { name: '菠菜', category: '蔬菜', calories: 23, protein: 2.9, fat: 0.3, carbs: 3.6, portion: '100g' },
  { name: '生菜', category: '蔬菜', calories: 15, protein: 1.4, fat: 0.2, carbs: 2.0, portion: '100g' },
  { name: '油麦菜', category: '蔬菜', calories: 15, protein: 1.5, fat: 0.2, carbs: 2.1, portion: '100g' },
  { name: '空心菜', category: '蔬菜', calories: 20, protein: 2.2, fat: 0.3, carbs: 3.1, portion: '100g' },
  { name: '西兰花', category: '蔬菜', calories: 34, protein: 2.8, fat: 0.4, carbs: 6.6, portion: '100g' },
  { name: '菜花', category: '蔬菜', calories: 25, protein: 1.8, fat: 0.3, carbs: 4.6, portion: '100g' },
  { name: '番茄', category: '蔬菜', calories: 18, protein: 0.9, fat: 0.2, carbs: 3.5, portion: '1个≈150g' },
  { name: '黄瓜', category: '蔬菜', calories: 15, protein: 0.7, fat: 0.1, carbs: 2.9, portion: '1根≈150g' },
  { name: '胡萝卜', category: '蔬菜', calories: 41, protein: 0.9, fat: 0.2, carbs: 9.6, portion: '1根≈100g' },
  { name: '白萝卜', category: '蔬菜', calories: 16, protein: 0.9, fat: 0.1, carbs: 3.0, portion: '100g' },
  { name: '茄子', category: '蔬菜', calories: 21, protein: 1.1, fat: 0.2, carbs: 4.9, portion: '1个≈200g' },
  { name: '青椒', category: '蔬菜', calories: 20, protein: 0.9, fat: 0.2, carbs: 4.6, portion: '1个≈80g' },
  { name: '洋葱', category: '蔬菜', calories: 40, protein: 1.1, fat: 0.1, carbs: 9.3, portion: '1个≈150g' },
  { name: '芹菜', category: '蔬菜', calories: 14, protein: 0.7, fat: 0.1, carbs: 3.3, portion: '100g' },
  { name: '韭菜', category: '蔬菜', calories: 26, protein: 2.4, fat: 0.4, carbs: 3.2, portion: '100g' },
  { name: '豆芽', category: '蔬菜', calories: 16, protein: 1.7, fat: 0.2, carbs: 2.6, portion: '100g' },
  { name: '冬瓜', category: '蔬菜', calories: 12, protein: 0.4, fat: 0.2, carbs: 2.6, portion: '100g' },
  { name: '南瓜', category: '蔬菜', calories: 22, protein: 0.7, fat: 0.1, carbs: 5.3, portion: '100g' },
  { name: '苦瓜', category: '蔬菜', calories: 19, protein: 1.0, fat: 0.1, carbs: 4.0, portion: '100g' },
  { name: '丝瓜', category: '蔬菜', calories: 20, protein: 1.0, fat: 0.2, carbs: 3.6, portion: '100g' },
  { name: '莲藕', category: '蔬菜', calories: 74, protein: 2.6, fat: 0.1, carbs: 16.4, portion: '100g' },
  { name: '蘑菇', category: '蔬菜', calories: 22, protein: 3.1, fat: 0.3, carbs: 3.3, portion: '100g' },
  { name: '木耳', category: '蔬菜', calories: 27, protein: 1.3, fat: 0.2, carbs: 6.0, portion: '100g(泡发)' },
  { name: '海带', category: '蔬菜', calories: 12, protein: 1.2, fat: 0.1, carbs: 2.0, portion: '100g' },
  { name: '玉米粒', category: '蔬菜', calories: 86, protein: 3.3, fat: 1.2, carbs: 19.0, portion: '100g' },
  { name: '豌豆', category: '蔬菜', calories: 81, protein: 5.4, fat: 0.4, carbs: 14.5, portion: '100g' },
  { name: '四季豆', category: '蔬菜', calories: 31, protein: 1.8, fat: 0.2, carbs: 5.7, portion: '100g' },

  // ═══ 水果 ═══
  { name: '苹果', category: '水果', calories: 52, protein: 0.3, fat: 0.2, carbs: 13.8, portion: '1个≈200g' },
  { name: '香蕉', category: '水果', calories: 89, protein: 1.1, fat: 0.3, carbs: 22.8, portion: '1根≈120g' },
  { name: '橙子', category: '水果', calories: 47, protein: 0.9, fat: 0.1, carbs: 11.8, portion: '1个≈200g' },
  { name: '葡萄', category: '水果', calories: 67, protein: 0.7, fat: 0.2, carbs: 17.2, portion: '1串≈200g' },
  { name: '西瓜', category: '水果', calories: 30, protein: 0.6, fat: 0.2, carbs: 6.8, portion: '1块≈300g' },
  { name: '草莓', category: '水果', calories: 32, protein: 0.7, fat: 0.3, carbs: 7.7, portion: '10颗≈150g' },
  { name: '蓝莓', category: '水果', calories: 57, protein: 0.7, fat: 0.3, carbs: 14.5, portion: '100g' },
  { name: '猕猴桃', category: '水果', calories: 61, protein: 1.1, fat: 0.5, carbs: 14.7, portion: '1个≈100g' },
  { name: '芒果', category: '水果', calories: 60, protein: 0.8, fat: 0.4, carbs: 14.0, portion: '1个≈200g' },
  { name: '梨', category: '水果', calories: 50, protein: 0.4, fat: 0.1, carbs: 13.0, portion: '1个≈200g' },
  { name: '桃子', category: '水果', calories: 48, protein: 0.9, fat: 0.3, carbs: 10.9, portion: '1个≈200g' },
  { name: '李子', category: '水果', calories: 46, protein: 0.7, fat: 0.3, carbs: 10.0, portion: '3个≈100g' },
  { name: '樱桃', category: '水果', calories: 50, protein: 1.0, fat: 0.2, carbs: 12.2, portion: '20颗≈100g' },
  { name: '柚子', category: '水果', calories: 42, protein: 0.8, fat: 0.1, carbs: 10.0, portion: '2瓣≈150g' },
  { name: '火龙果', category: '水果', calories: 55, protein: 1.1, fat: 0.4, carbs: 13.0, portion: '1个≈300g' },
  { name: '榴莲', category: '水果', calories: 147, protein: 1.5, fat: 5.3, carbs: 27.1, portion: '1瓣≈100g' },
  { name: '荔枝', category: '水果', calories: 66, protein: 0.8, fat: 0.4, carbs: 16.5, portion: '10颗≈200g' },
  { name: '龙眼', category: '水果', calories: 60, protein: 1.2, fat: 0.1, carbs: 15.5, portion: '20颗≈100g' },
  { name: '哈密瓜', category: '水果', calories: 34, protein: 0.8, fat: 0.1, carbs: 8.0, portion: '1块≈200g' },
  { name: '菠萝', category: '水果', calories: 41, protein: 0.5, fat: 0.1, carbs: 10.8, portion: '1块≈150g' },

  // ═══ 蛋奶 ═══
  { name: '鸡蛋(煮)', category: '蛋奶', calories: 144, protein: 13.3, fat: 9.5, carbs: 1.5, portion: '1个≈50g' },
  { name: '鸡蛋(炒)', category: '蛋奶', calories: 196, protein: 13.0, fat: 15.0, carbs: 2.0, portion: '2个≈120g' },
  { name: '鸭蛋', category: '蛋奶', calories: 180, protein: 12.6, fat: 13.0, carbs: 3.1, portion: '1个≈70g' },
  { name: '鹌鹑蛋', category: '蛋奶', calories: 160, protein: 12.8, fat: 11.1, carbs: 2.1, portion: '5个≈50g' },
  { name: '蛋白', category: '蛋奶', calories: 48, protein: 11.6, fat: 0.1, carbs: 0.7, portion: '1个≈30g' },
  { name: '蛋黄', category: '蛋奶', calories: 328, protein: 15.2, fat: 28.2, carbs: 3.4, portion: '1个≈20g' },
  { name: '全脂牛奶', category: '蛋奶', calories: 61, protein: 3.0, fat: 3.2, carbs: 4.8, portion: '1杯≈250ml' },
  { name: '低脂牛奶', category: '蛋奶', calories: 43, protein: 3.3, fat: 1.0, carbs: 5.0, portion: '1杯≈250ml' },
  { name: '脱脂牛奶', category: '蛋奶', calories: 35, protein: 3.4, fat: 0.1, carbs: 5.0, portion: '1杯≈250ml' },
  { name: '酸奶(原味)', category: '蛋奶', calories: 72, protein: 2.5, fat: 2.7, carbs: 9.3, portion: '1杯≈200g' },
  { name: '酸奶(无糖)', category: '蛋奶', calories: 56, protein: 3.0, fat: 3.0, carbs: 4.0, portion: '1杯≈200g' },
  { name: '奶酪', category: '蛋奶', calories: 328, protein: 25.7, fat: 23.5, carbs: 3.5, portion: '1片≈20g' },
  { name: '黄油', category: '蛋奶', calories: 717, protein: 0.9, fat: 81.1, carbs: 0.1, portion: '1小盒≈10g' },

  // ═══ 豆类 ═══
  { name: '北豆腐', category: '豆类', calories: 98, protein: 12.2, fat: 4.8, carbs: 2.0, portion: '1块≈200g' },
  { name: '南豆腐', category: '豆类', calories: 57, protein: 6.2, fat: 2.5, carbs: 2.6, portion: '1块≈200g' },
  { name: '内酯豆腐', category: '豆类', calories: 49, protein: 5.0, fat: 1.9, carbs: 3.3, portion: '1盒≈300g' },
  { name: '豆腐干', category: '豆类', calories: 140, protein: 16.2, fat: 3.6, carbs: 10.0, portion: '5块≈100g' },
  { name: '腐竹', category: '豆类', calories: 459, protein: 44.6, fat: 21.7, carbs: 22.3, portion: '100g(干)' },
  { name: '黄豆', category: '豆类', calories: 359, protein: 35.0, fat: 16.0, carbs: 34.2, portion: '100g' },
  { name: '绿豆', category: '豆类', calories: 316, protein: 21.6, fat: 0.8, carbs: 62.0, portion: '100g' },
  { name: '红豆', category: '豆类', calories: 324, protein: 21.4, fat: 0.6, carbs: 60.7, portion: '100g' },
  { name: '豆浆', category: '豆类', calories: 31, protein: 2.4, fat: 0.8, carbs: 4.5, portion: '1杯≈300ml' },
  { name: '毛豆', category: '豆类', calories: 131, protein: 13.1, fat: 5.0, carbs: 10.5, portion: '100g' },

  // ═══ 水产 ═══
  { name: '草鱼', category: '水产', calories: 113, protein: 16.6, fat: 5.2, carbs: 0, portion: '100g' },
  { name: '鲫鱼', category: '水产', calories: 108, protein: 17.1, fat: 2.7, carbs: 3.8, portion: '1条≈300g' },
  { name: '鲈鱼', category: '水产', calories: 105, protein: 18.6, fat: 3.4, carbs: 0, portion: '1条≈400g' },
  { name: '带鱼', category: '水产', calories: 127, protein: 17.7, fat: 4.9, carbs: 3.2, portion: '100g' },
  { name: '三文鱼', category: '水产', calories: 208, protein: 20.4, fat: 13.6, carbs: 0, portion: '100g' },
  { name: '鳕鱼', category: '水产', calories: 88, protein: 20.4, fat: 0.5, carbs: 0, portion: '100g' },
  { name: '虾仁', category: '水产', calories: 99, protein: 20.3, fat: 0.7, carbs: 1.5, portion: '10只≈150g' },
  { name: '基围虾', category: '水产', calories: 87, protein: 18.6, fat: 0.8, carbs: 2.8, portion: '10只≈150g' },
  { name: '小龙虾', category: '水产', calories: 93, protein: 16.0, fat: 2.5, carbs: 1.0, portion: '100g(肉)' },
  { name: '螃蟹', category: '水产', calories: 95, protein: 13.8, fat: 2.3, carbs: 4.7, portion: '1只≈200g' },
  { name: '蛤蜊', category: '水产', calories: 56, protein: 7.6, fat: 0.4, carbs: 5.0, portion: '100g' },
  { name: '鱿鱼', category: '水产', calories: 75, protein: 17.4, fat: 0.8, carbs: 0, portion: '100g' },
  { name: '海参', category: '水产', calories: 25, protein: 6.0, fat: 0.1, carbs: 0, portion: '100g' },
  { name: '金枪鱼', category: '水产', calories: 144, protein: 23.3, fat: 4.9, carbs: 0, portion: '100g' },

  // ═══ 小吃/加工 ═══
  { name: '饼干', category: '小吃', calories: 433, protein: 7.0, fat: 13.0, carbs: 72.0, portion: '5片≈50g' },
  { name: '薯片', category: '小吃', calories: 548, protein: 5.0, fat: 35.0, carbs: 53.0, portion: '1包≈50g' },
  { name: '蛋糕', category: '小吃', calories: 347, protein: 5.0, fat: 15.0, carbs: 48.0, portion: '1块≈100g' },
  { name: '月饼', category: '小吃', calories: 428, protein: 6.0, fat: 20.0, carbs: 56.0, portion: '1个≈100g' },
  { name: '粽子', category: '小吃', calories: 186, protein: 4.0, fat: 1.0, carbs: 40.0, portion: '1个≈150g' },
  { name: '方便面', category: '小吃', calories: 472, protein: 9.5, fat: 21.1, carbs: 60.9, portion: '1包≈80g' },
  { name: '巧克力', category: '小吃', calories: 546, protein: 4.2, fat: 31.0, carbs: 59.0, portion: '1块≈20g' },
  { name: '冰淇淋', category: '小吃', calories: 207, protein: 3.5, fat: 10.0, carbs: 25.0, portion: '1球≈80g' },
  { name: '辣条', category: '小吃', calories: 425, protein: 8.0, fat: 20.0, carbs: 53.0, portion: '1包≈100g' },
  { name: '坚果(混合)', category: '小吃', calories: 607, protein: 20.0, fat: 53.0, carbs: 16.0, portion: '1把≈30g' },
  { name: '核桃', category: '小吃', calories: 654, protein: 15.2, fat: 65.2, carbs: 13.7, portion: '5个≈30g' },
  { name: '花生', category: '小吃', calories: 567, protein: 25.8, fat: 49.2, carbs: 16.1, portion: '1把≈30g' },
  { name: '瓜子', category: '小吃', calories: 582, protein: 20.0, fat: 50.0, carbs: 20.0, portion: '1把≈30g' },
  { name: '山楂片', category: '小吃', calories: 329, protein: 1.0, fat: 0.5, carbs: 80.0, portion: '5片≈30g' },

  // ═══ 饮品 ═══
  { name: '可乐', category: '饮品', calories: 42, protein: 0, fat: 0, carbs: 10.8, portion: '1罐≈330ml' },
  { name: '雪碧', category: '饮品', calories: 41, protein: 0, fat: 0, carbs: 10.2, portion: '1罐≈330ml' },
  { name: '橙汁', category: '饮品', calories: 46, protein: 0.7, fat: 0, carbs: 10.4, portion: '1杯≈300ml' },
  { name: '奶茶', category: '饮品', calories: 278, protein: 3.0, fat: 8.0, carbs: 48.0, portion: '1杯≈500ml' },
  { name: '拿铁咖啡', category: '饮品', calories: 56, protein: 2.5, fat: 2.5, carbs: 5.5, portion: '1杯≈350ml' },
  { name: '美式咖啡', category: '饮品', calories: 4, protein: 0.1, fat: 0, carbs: 0.7, portion: '1杯≈350ml' },
  { name: '啤酒', category: '饮品', calories: 43, protein: 0.5, fat: 0, carbs: 3.6, portion: '1瓶≈500ml' },
  { name: '白酒', category: '饮品', calories: 298, protein: 0, fat: 0, carbs: 0, portion: '1两≈50ml' },
  { name: '红酒', category: '饮品', calories: 85, protein: 0.1, fat: 0, carbs: 2.6, portion: '1杯≈150ml' },
  { name: '运动饮料', category: '饮品', calories: 24, protein: 0, fat: 0, carbs: 6.0, portion: '1瓶≈500ml' },
  { name: '柠檬水', category: '饮品', calories: 8, protein: 0, fat: 0, carbs: 2.0, portion: '1杯≈300ml' },

  // ═══ 调味/油脂 ═══
  { name: '植物油', category: '调味', calories: 899, protein: 0, fat: 99.9, carbs: 0, portion: '1汤匙≈10g' },
  { name: '猪油', category: '调味', calories: 900, protein: 0, fat: 99.9, carbs: 0, portion: '1汤匙≈10g' },
  { name: '酱油', category: '调味', calories: 53, protein: 5.6, fat: 0, carbs: 8.0, portion: '1汤匙≈10ml' },
  { name: '醋', category: '调味', calories: 18, protein: 0.4, fat: 0, carbs: 4.0, portion: '1汤匙≈10ml' },
  { name: '白砂糖', category: '调味', calories: 387, protein: 0, fat: 0, carbs: 99.9, portion: '1汤匙≈10g' },
  { name: '蜂蜜', category: '调味', calories: 321, protein: 0.4, fat: 0, carbs: 80.3, portion: '1汤匙≈10g' },
  { name: '豆瓣酱', category: '调味', calories: 178, protein: 10.0, fat: 8.0, carbs: 17.0, portion: '1汤匙≈15g' },
  { name: '辣椒酱', category: '调味', calories: 131, protein: 3.0, fat: 8.0, carbs: 12.0, portion: '1汤匙≈15g' },
  { name: '味精', category: '调味', calories: 268, protein: 40.0, fat: 0, carbs: 27.0, portion: '1小勺≈3g' },
  { name: '盐', category: '调味', calories: 0, protein: 0, fat: 0, carbs: 0, portion: '1小勺≈5g' },
  { name: '料酒', category: '调味', calories: 45, protein: 0.5, fat: 0, carbs: 3.0, portion: '1汤匙≈10ml' },
  { name: '蚝油', category: '调味', calories: 114, protein: 2.5, fat: 0.5, carbs: 25.0, portion: '1汤匙≈15g' },
  { name: '番茄酱', category: '调味', calories: 81, protein: 1.7, fat: 0.2, carbs: 17.8, portion: '1汤匙≈15g' },
  { name: '芝麻酱', category: '调味', calories: 618, protein: 19.2, fat: 52.7, carbs: 16.8, portion: '1汤匙≈15g' },
  { name: '味精', category: '调味', calories: 0, protein: 0, fat: 0, carbs: 0, portion: '少量' },

  // ═══ 中式特色菜 ═══
  { name: '红烧肉', category: '肉类', calories: 350, protein: 12.0, fat: 32.0, carbs: 5.0, portion: '1份≈150g' },
  { name: '宫保鸡丁', category: '肉类', calories: 210, protein: 18.0, fat: 12.0, carbs: 8.0, portion: '1份≈200g' },
  { name: '鱼香肉丝', category: '肉类', calories: 180, protein: 12.0, fat: 10.0, carbs: 10.0, portion: '1份≈200g' },
  { name: '麻婆豆腐', category: '豆类', calories: 130, protein: 8.0, fat: 8.0, carbs: 6.0, portion: '1份≈200g' },
  { name: '西红柿炒蛋', category: '蛋奶', calories: 105, protein: 7.0, fat: 6.0, carbs: 5.0, portion: '1份≈200g' },
  { name: '酸辣土豆丝', category: '蔬菜', calories: 90, protein: 2.0, fat: 4.0, carbs: 13.0, portion: '1份≈200g' },
  { name: '水煮鱼', category: '水产', calories: 180, protein: 15.0, fat: 12.0, carbs: 3.0, portion: '1份≈250g' },
  { name: '回锅肉', category: '肉类', calories: 320, protein: 14.0, fat: 28.0, carbs: 4.0, portion: '1份≈150g' },
  { name: '地三鲜', category: '蔬菜', calories: 120, protein: 3.0, fat: 8.0, carbs: 12.0, portion: '1份≈200g' },
  { name: '干煸四季豆', category: '蔬菜', calories: 110, protein: 3.0, fat: 7.0, carbs: 10.0, portion: '1份≈150g' },
  { name: '糖醋里脊', category: '肉类', calories: 280, protein: 14.0, fat: 14.0, carbs: 25.0, portion: '1份≈150g' },
  { name: '水煮肉片', category: '肉类', calories: 240, protein: 15.0, fat: 18.0, carbs: 5.0, portion: '1份≈200g' },
  { name: '清蒸鲈鱼', category: '水产', calories: 110, protein: 16.0, fat: 3.0, carbs: 1.0, portion: '1份≈300g' },
  { name: '红烧排骨', category: '肉类', calories: 310, protein: 16.0, fat: 25.0, carbs: 5.0, portion: '1份≈150g' },
  { name: '可乐鸡翅', category: '肉类', calories: 240, protein: 17.0, fat: 12.0, carbs: 15.0, portion: '5个≈150g' },
]
