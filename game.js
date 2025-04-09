// 游戏状态
const gameState = {
    health: 10,
    wealth: 5,
    year: 1,
    cards: [],
    remainingCards: [],
    attributes: null
};

// 加载卡牌数据
async function loadCards() {
    try {
        const response = await fetch('card.json');
        const data = await response.json();
        // 保存属性配置
        gameState.attributes = data.attributes;
        // 初始化卡牌（每种卡牌只出现一次）
        gameState.cards = [...data.cards];
        gameState.remainingCards = [...gameState.cards];
        
        updateRemainingCardsList();
        drawCards();
    } catch (error) {
        console.error('Error loading cards:', error);
    }
}

// 更新剩余卡牌列表
function updateRemainingCardsList() {
    const remainingCardsList = document.getElementById('remaining-cards-list');
    remainingCardsList.innerHTML = '';
    
    // 按稀有度排序卡牌
    const rarityOrder = { 'white': 0, 'green': 1, 'blue': 2, 'special': 3 };
    const sortedCards = [...gameState.remainingCards].sort((a, b) => {
        // 首先按稀有度排序
        const rarityDiff = rarityOrder[a.rarity] - rarityOrder[b.rarity];
        if (rarityDiff !== 0) return rarityDiff;
        // 然后按名称排序
        return a.name.localeCompare(b.name);
    });
    
    sortedCards.forEach(card => {
        const cardItem = document.createElement('div');
        cardItem.className = 'remaining-card-item';
        
        const rarityIndicator = document.createElement('span');
        rarityIndicator.className = `card-rarity-indicator rarity-${card.rarity}`;
        
        const cardName = document.createElement('span');
        cardName.className = 'card-name';
        cardName.textContent = card.name;
        
        cardItem.appendChild(rarityIndicator);
        cardItem.appendChild(cardName);
        
        remainingCardsList.appendChild(cardItem);
    });
}

// 更新属性显示
function updateStats() {
    try {
        if (!gameState.attributes) return;

        // 更新数值和文字
        Object.entries(gameState.attributes).forEach(([key, config]) => {
            const valueElement = document.querySelector(`.${key} .stat-value`);
            const textElement = document.querySelector(`.${key} .stat-text`);
            
            if (valueElement) valueElement.textContent = gameState[key];
            if (textElement) textElement.textContent = config.name;
        });
        
        console.log('属性更新成功:', {
            health: gameState.health,
            wealth: gameState.wealth
        });
    } catch (error) {
        console.error('更新属性时出错:', error);
    }
}

// 获取健康值文字描述
function getHealthText(health) {
    if (health <= 2) return "危在旦夕";
    if (health <= 4) return "虚弱";
    if (health <= 6) return "一般";
    if (health <= 8) return "健康";
    return "非常健康";
}

// 获取年龄文字描述
function getAgeText(age) {
    if (age <= 25) return "年轻";
    if (age <= 35) return "成熟";
    if (age <= 45) return "中年";
    if (age <= 55) return "中老年";
    return "老年";
}

// 获取财富文字描述
function getWealthText(wealth) {
    if (wealth <= 2) return "贫困";
    if (wealth <= 4) return "普通";
    if (wealth <= 6) return "小康";
    if (wealth <= 8) return "富裕";
    return "富豪";
}

// 随机抽取两张卡牌
function drawCards() {
    const cardSlots = document.querySelectorAll('.card-slot');
    cardSlots.forEach(slot => {
        if (gameState.remainingCards.length > 0) {
            const randomIndex = Math.floor(Math.random() * gameState.remainingCards.length);
            const card = gameState.remainingCards[randomIndex];
            
            // 创建卡牌元素
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.setAttribute('data-rarity', card.rarity);
            cardElement.innerHTML = `
                <div class="card-front">
                    <div class="card-title">${card.name}</div>
                    <div class="card-content">${card.desc}</div>
                </div>
                <div class="card-back">
                    <div class="card-pattern"></div>
                </div>
            `;
            
            // 添加点击事件
            cardElement.addEventListener('click', () => handleCardClick(card, cardElement));
            
            // 清空卡槽并添加新卡牌
            slot.innerHTML = '';
            slot.appendChild(cardElement);
            
            // 添加飞入动画
            cardElement.style.animation = 'slideIn 0.5s ease-out';
        }
    });
    updateRemainingCardsList();
}

// 处理卡牌点击
function handleCardClick(card, cardElement) {
    // 禁用所有卡牌点击
    document.querySelectorAll('.card').forEach(c => c.style.pointerEvents = 'none');
    
    // 翻转动画
    cardElement.style.transform = 'rotateY(180deg)';
    
    // 随机选择一个事件
    const randomEventIndex = Math.floor(Math.random() * card.events.length);
    const selectedEvent = card.events[randomEventIndex];
    
    // 显示事件描述
    const eventPanel = document.querySelector('.event-panel');
    const description = document.createElement('div');
    description.className = 'event-description';
    description.textContent = selectedEvent.desc;
    eventPanel.innerHTML = '';
    eventPanel.appendChild(description);
    
    // 创建选项按钮
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'options-container';
    
    selectedEvent.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.textContent = option.text;
        button.className = 'option-button';
        button.style.opacity = '0';
        button.style.animation = `fadeIn 0.5s ease-out ${index * 0.2}s forwards`;
        
        button.addEventListener('click', () => handleOptionSelect(option, card));
        optionsContainer.appendChild(button);
    });
    
    eventPanel.appendChild(optionsContainer);
}

// 处理选项选择
function handleOptionSelect(option, card) {
    console.log('选择选项:', option.text);
    console.log('当前年份:', gameState.year);
    
    // 创建结果显示容器
    const resultContainer = document.createElement('div');
    resultContainer.className = 'result-container';
    resultContainer.style.opacity = '0';
    resultContainer.style.animation = 'fadeIn 0.5s ease-out forwards';
    
    // 显示选择结果
    const resultText = document.createElement('p');
    resultText.className = 'result-text';
    resultText.textContent = option.result;
    resultContainer.appendChild(resultText);
    
    // 显示效果
    const effectsList = document.createElement('ul');
    effectsList.className = 'effects-list';
    
    Object.entries(option.effect).forEach(([stat, value]) => {
        let finalValue = value;
        if (typeof value === 'string' && value.startsWith('random')) {
            const [min, max] = value.match(/-?\d+/g).map(Number);
            finalValue = Math.floor(Math.random() * (max - min + 1)) + min;
        }
        
        const effectItem = document.createElement('li');
        effectItem.className = 'effect-item';
        
        // 根据属性类型设置图标
        let icon = '';
        switch(stat) {
            case 'health': icon = '❤️'; break;
            case 'wealth': icon = '💰'; break;
        }
        
        // 设置效果文本和样式
        const changeText = finalValue > 0 ? `+${finalValue}` : finalValue;
        effectItem.innerHTML = `${icon} ${getStatName(stat)}: <span class="${finalValue > 0 ? 'positive' : 'negative'}">${changeText}</span>`;
        effectsList.appendChild(effectItem);
        
        // 更新游戏状态
        gameState[stat] += finalValue;
        console.log(`更新${stat}:`, gameState[stat]);
    });
    
    resultContainer.appendChild(effectsList);
    
    // 将结果显示添加到事件面板
    const eventPanel = document.querySelector('.event-panel');
    eventPanel.appendChild(resultContainer);
    
    // 更新显示
    updateStats();
    
    // 检查游戏结束条件
    if (gameState.health <= 0 || gameState.wealth <= 0) {
        showGameOver();
        return;
    }
    
    // 如果是特殊卡片（一次性卡片），从剩余卡牌中移除
    if (card.rarity === 'special') {
        const cardIndex = gameState.remainingCards.findIndex(c => c.id === card.id);
        if (cardIndex !== -1) {
            gameState.remainingCards.splice(cardIndex, 1);
        }
    }
    
    updateRemainingCardsList();
    
    console.log('准备开始新的一年');
    // 延迟开始新的一年
    setTimeout(() => {
        console.log('开始新的一年');
        startNewYear();
    }, 1000);
}

// 获取属性名称
function getStatName(stat) {
    switch(stat) {
        case 'health': return '健康';
        case 'wealth': return '财富';
        default: return stat;
    }
}

// 开始新的一年
function startNewYear() {
    console.log('startNewYear 开始执行');
    console.log('更新前年份:', gameState.year);
    
    // 更新年份
    gameState.year++;
    
    console.log('更新后年份:', gameState.year);
    
    // 年份翻页动画
    const yearDisplay = document.querySelector('.year');
    yearDisplay.style.animation = 'flipPage 0.5s ease-out';
    setTimeout(() => {
        yearDisplay.textContent = `第${gameState.year}年`;
        yearDisplay.style.animation = '';
        console.log('年份显示已更新');
    }, 250);
    
    // 清空事件面板
    document.querySelector('.event-panel').innerHTML = '';
    console.log('事件面板已清空');
    
    // 抽取新卡牌
    drawCards();
    console.log('新卡牌已抽取');
}

// 显示游戏结束界面
function showGameOver() {
    const modal = document.getElementById('gameOverModal');
    modal.style.display = 'flex';
}

// 重新开始游戏
function restartGame() {
    gameState.health = 10;
    gameState.wealth = 5;
    gameState.year = 1;
    gameState.remainingCards = [...gameState.cards];
    
    updateStats();
    updateRemainingCardsList();
    
    document.getElementById('gameOverModal').style.display = 'none';
    startNewYear();
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', async () => {
    await loadCards();
    updateStats();
    
    // 显示初始年份
    const yearDisplay = document.querySelector('.year');
    yearDisplay.textContent = `第${gameState.year}年`;
    
    // 抽取初始卡牌
    drawCards();
    
    // 添加重新开始按钮事件监听
    document.getElementById('restartButton').addEventListener('click', restartGame);
}); 