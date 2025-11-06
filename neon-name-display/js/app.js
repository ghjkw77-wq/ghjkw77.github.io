// JavaScript代码实现
const familyNames = [
  '王俊杰', '唐雪涵', '张洲', '张静', '张冲',
  '唐旗', '唐文思', '罗尹', '郑十一', '王十二'
];

// 获取从屏幕边缘到对边的流星轨迹
function getRandomEdgePosition() {
  // 随机选择起点边缘 (0: 上, 1: 右, 2: 下, 3: 左)
  const startEdge = Math.floor(Math.random() * 4);
  
  // 确定对应的终点边缘 (对边)
  const endEdge = (startEdge + 2) % 4;
  
  let startX, startY, targetX, targetY;
  
  switch(startEdge) {
    case 0: // 上边
      startX = Math.random() * window.innerWidth;
      startY = -50; // 从屏幕上方略微外侧开始
      // 终点在下方，X坐标在1/4到3/4屏幕宽度之间
      targetX = Math.random() * window.innerWidth * 0.5 + window.innerWidth * 0.25;
      targetY = window.innerHeight + 50; // 到屏幕下方略微外侧结束
      break;
    case 1: // 右边
      startX = window.innerWidth + 50; // 从屏幕右侧略微外侧开始
      startY = Math.random() * window.innerHeight;
      // 终点在左侧，Y坐标在1/4到3/4屏幕高度之间
      targetX = -50;
      targetY = Math.random() * window.innerHeight * 0.5 + window.innerHeight * 0.25;
      break;
    case 2: // 下边
      startX = Math.random() * window.innerWidth;
      startY = window.innerHeight + 50; // 从屏幕下方略微外侧开始
      // 终点在上方，X坐标在1/4到3/4屏幕宽度之间
      targetX = Math.random() * window.innerWidth * 0.5 + window.innerWidth * 0.25;
      targetY = -50; // 到屏幕上方略微外侧结束
      break;
    case 3: // 左边
      startX = -50; // 从屏幕左侧略微外侧开始
      startY = Math.random() * window.innerHeight;
      // 终点在右侧，Y坐标在1/4到3/4屏幕高度之间
      targetX = window.innerWidth + 50;
      targetY = Math.random() * window.innerHeight * 0.5 + window.innerHeight * 0.25;
      break;
  }
  
  return {
    x: `${startX}px`,
    y: `${startY}px`,
    targetX: `${targetX}px`,
    targetY: `${targetY}px`
  };
}

// 创建更明显的流星尾迹效果
function createTrailElement(element, color) {
  const trail = document.createElement('div');
  trail.classList.add('name-trail');
  trail.style.setProperty('--neon-color', color);
  trail.style.left = '100%';
  trail.style.top = '50%';
  trail.style.transform = 'translateY(-50%)';
  // 增强尾迹效果
  trail.style.height = '3px'; // 增加尾迹宽度
  trail.style.opacity = '0.8'; // 增加初始透明度
  trail.style.boxShadow = `0 0 5px ${color}, 0 0 10px ${color}`; // 添加发光效果
  return trail;
}

// 更新流线位置的函数
// 性能优化：使用requestAnimationFrame更新流线
let trailsAnimationFrame;
let lastUpdateTime = 0;
const TRAIL_UPDATE_INTERVAL = 100; // 每100ms更新一次，减少DOM操作

function updateTrails() {
  const now = performance.now();
  
  // 控制更新频率，避免过于频繁的DOM操作
  if (now - lastUpdateTime < TRAIL_UPDATE_INTERVAL) {
    trailsAnimationFrame = requestAnimationFrame(updateTrails);
    return;
  }
  
  lastUpdateTime = now;
  
  const nameElements = document.querySelectorAll('.name-element');
  
  // 性能优化：限制同时处理的元素数量
  const maxElementsPerFrame = 10;
  const elementsToProcess = Array.from(nameElements).slice(0, maxElementsPerFrame);
  
  elementsToProcess.forEach(element => {
    // 获取元素的位置和变换信息
    const style = window.getComputedStyle(element);
    const transform = style.transform;
    
    // 从transform中提取旋转角度 - 性能优化
    let rotation = 0;
    try {
      const matrix = new DOMMatrix(transform);
      rotation = Math.atan2(matrix.b, matrix.a) * (180 / Math.PI);
    } catch (e) {
      // 回退方案
      const matrixMatch = transform.match(/matrix\(([^)]+)\)/);
      if (matrixMatch) {
        const matrixValues = matrixMatch[1].split(', ');
        if (matrixValues.length >= 6) {
          rotation = Math.atan2(parseFloat(matrixValues[1]), parseFloat(matrixValues[0])) * (180 / Math.PI);
        }
      }
    }
    
    // 创建新的流线
    const hue = element.style.getPropertyValue('--neon-color');
    const trail = createTrailElement(element, hue);
    
    // 设置流线的位置和旋转
    trail.style.transform = `translateY(-50%) rotate(${rotation}deg)`;
    
    // 添加流线到容器
    element.appendChild(trail);
    
    // 移除过期的流线 - 减少最大数量以提高性能
    const trails = element.querySelectorAll('.name-trail');
    if (trails.length > 2) { // 减少到2条，减轻DOM负担
      trails[0].remove();
    }
  });
  
  // 继续下一帧的更新
  trailsAnimationFrame = requestAnimationFrame(updateTrails);
}

function createNameElement(name) {
  const element = document.createElement('div');
  element.classList.add('name-element', 'neon-text');
  element.textContent = name;
  
  const position = getRandomEdgePosition();
  
  // 降低流动速度，将时间延长为原来的两倍
  const duration = 4 + Math.random() * 10; // 4-14秒，降低为原来的一半速度
  const delay = Math.random() * 2; // 0-2秒，降低出现频率为原来的一半
  const hue = Math.floor(Math.random() * 360); // 随机颜色
  
  element.style.setProperty('--start-x', position.x);
  element.style.setProperty('--start-y', position.y);
  element.style.setProperty('--end-x', position.targetX);
  element.style.setProperty('--end-y', position.targetY);
  element.style.setProperty('--neon-color', `hsl(${hue}, 100%, 50%)`);
  element.style.animation = `floatAnimation ${duration}s linear ${delay}s infinite`;
  element.style.animationDuration = `${duration}s`;
  element.style.animationDelay = `${delay}s`;
  
  // 增强发光效果，使姓名更显眼
  element.style.boxShadow = `0 0 10px hsl(${hue}, 100%, 50%), 0 0 20px hsl(${hue}, 100%, 50%)`;
  
  // 计算元素流动方向，使文字朝向与移动方向一致
  const startX = parseFloat(position.x);
  const startY = parseFloat(position.y);
  const endX = parseFloat(position.targetX);
  const endY = parseFloat(position.targetY);
  
  // 计算移动角度并设置元素旋转
  const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);
  element.style.transform = `rotate(${angle}deg)`;
  
  return element;
}

function spawnNameElements(count = 5) { // 降低默认生成数量为原来的一半
  const container = document.getElementById('name-container');
  
  for (let i = 0; i < count; i++) {
    const randomName = familyNames[Math.floor(Math.random() * familyNames.length)];
    const element = createNameElement(randomName);
    
    // 为循环流动的元素添加增强效果
    enhanceNameElement(element);
    
    container.appendChild(element);
  }
}

function handleResize() {
  // 更新容器尺寸
  const container = document.getElementById('name-container');
  container.style.width = `${window.innerWidth}px`;
  container.style.height = `${window.innerHeight}px`;
  
  // 重新计算现有元素位置
  const elements = document.querySelectorAll('.name-element');
  elements.forEach(element => {
    // 保存原有的起始/结束位置比例
    const startX = parseFloat(element.style.getPropertyValue('--start-x')) / 100;
    const startY = parseFloat(element.style.getPropertyValue('--start-y')) / 100;
    const endX = parseFloat(element.style.getPropertyValue('--end-x')) / 100;
    const endY = parseFloat(element.style.getPropertyValue('--end-y')) / 100;
    
    // 重新应用位置
    element.style.setProperty('--start-x', `${startX * 100}vw`);
    element.style.setProperty('--start-y', `${startY * 100}vh`);
    element.style.setProperty('--end-x', `${endX * 100}vw`);
    element.style.setProperty('--end-y', `${endY * 100}vh`);
    
    // 重置动画以适应新尺寸
    const computedStyle = window.getComputedStyle(element);
    const animation = computedStyle.animation;
    element.style.animation = 'none';
    element.offsetHeight; // 触发重绘
    element.style.animation = animation;
  });
}

function setupMouseInteractions() {
  const container = document.getElementById('name-container');
  
  container.addEventListener('mousemove', function(e) {
    // 鼠标附近的元素轻微偏移，创造互动感
    const elements = document.querySelectorAll('.name-element');
    elements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
      
      // 距离鼠标100px内的元素产生偏移
      if (distance < 100) {
        const offsetX = (distanceX / distance) * (100 - distance) * 0.1;
        const offsetY = (distanceY / distance) * (100 - distance) * 0.1;
        element.style.transform = element.style.transform.replace(/ translate\([^)]*\)/g, '') + ` translate(${offsetX}px, ${offsetY}px)`;
      }
    });
  });
  
  // 点击添加新姓名
  container.addEventListener('click', function() {
    const randomName = familyNames[Math.floor(Math.random() * familyNames.length)];
    const element = createNameElement(randomName);
    container.appendChild(element);
    
    element.addEventListener('animationend', function() {
      container.removeChild(element);
    });
  });
}

function setupTouchInteractions() {
  const container = document.getElementById('name-container');
  let isTouched = false;
  
  container.addEventListener('touchstart', function(e) {
    isTouched = true;
    // 触摸添加新姓名
    const randomName = familyNames[Math.floor(Math.random() * familyNames.length)];
    const element = createNameElement(randomName);
    container.appendChild(element);
    
    element.addEventListener('animationend', function() {
      container.removeChild(element);
    });
    
    e.preventDefault(); // 阻止默认行为
  });
  
  container.addEventListener('touchmove', function(e) {
    if (!isTouched) return;
    
    const touch = e.touches[0];
    // 触摸移动时的元素偏移效果，类似鼠标移动
    const elements = document.querySelectorAll('.name-element');
    elements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const distanceX = touch.clientX - centerX;
      const distanceY = touch.clientY - centerY;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
      
      if (distance < 100) {
        const offsetX = (distanceX / distance) * (100 - distance) * 0.1;
        const offsetY = (distanceY / distance) * (100 - distance) * 0.1;
        element.style.transform = element.style.transform.replace(/ translate\([^)]*\)/g, '') + ` translate(${offsetX}px, ${offsetY}px)`;
      }
    });
    
    e.preventDefault();
  });
  
  container.addEventListener('touchend', function() {
    isTouched = false;
  });
}

function init() {
  handleResize();
  window.addEventListener('resize', handleResize);
  spawnNameElements(7); // 降低元素数量为原来的一半
  setupMouseInteractions();
  setupTouchInteractions();
  
  // 定期更新流线效果
  setInterval(updateTrails, 100); // 每100毫秒创建新流线
}

// 创建霓虹线条
function createNeonLines() {
  const container = document.querySelector('.neon-lines-container');
  const linesCount = 8; // 线条数量
  
  for (let i = 0; i < linesCount; i++) {
    const line = document.createElement('div');
    line.classList.add('neon-line');
    
    // 随机位置和颜色
    const top = Math.random() * 100;
    const width = Math.random() * 300 + 100; // 100-400px
    const delay = Math.random() * 10; // 0-10s延迟
    const duration = Math.random() * 20 + 20; // 20-40s持续时间
    const hue = Math.floor(Math.random() * 360); // 随机颜色
    
    line.style.top = `${top}vh`;
    line.style.width = `${width}px`;
    line.style.setProperty('--neon-color', `hsl(${hue}, 100%, 50%)`);
    line.style.animation = `line-float ${duration}s linear ${delay}s infinite`;
    
    container.appendChild(line);
  }
}

// 创建屏幕霓虹闪动效果
function createNeonFlashes() {
  // 确保容器存在
  let flashContainer = document.querySelector('.neon-flash-container');
  if (!flashContainer) {
    flashContainer = document.createElement('div');
    flashContainer.classList.add('neon-flash-container');
    document.body.appendChild(flashContainer);
  }
  
  // 创建霓虹光束
  const beamCount = 15;
  const beamColors = ['var(--neon-pink)', 'var(--neon-blue)', 'var(--neon-purple)', 'var(--neon-green)'];
  
  for (let i = 0; i < beamCount; i++) {
    const beam = document.createElement('div');
    beam.classList.add('neon-beam');
    
    // 随机属性
    const orientation = Math.random() > 0.5 ? 'horizontal' : 'vertical';
    const color = beamColors[Math.floor(Math.random() * beamColors.length)];
    const delay = Math.random() * 5; // 0-5s延迟
    
    if (orientation === 'horizontal') {
      // 水平光束
      beam.style.width = `${Math.random() * 60 + 40}vw`;
      beam.style.height = `${Math.random() * 2 + 1}px`;
      beam.style.left = `${Math.random() * 100}vw`;
      beam.style.top = `${Math.random() * 100}vh`;
      beam.style.transform = 'translateX(-50%)';
    } else {
      // 垂直光束
      beam.style.width = `${Math.random() * 2 + 1}px`;
      beam.style.height = `${Math.random() * 60 + 40}vh`;
      beam.style.left = `${Math.random() * 100}vw`;
      beam.style.top = `${Math.random() * 100}vh`;
      beam.style.transform = 'translateY(-50%)';
    }
    
    beam.style.color = color;
    beam.style.animationDelay = `${delay}s`;
    
    flashContainer.appendChild(beam);
  }
  
  // 创建霓虹脉冲
  const pulseCount = 3;
  for (let i = 0; i < pulseCount; i++) {
    const pulse = document.createElement('div');
    pulse.classList.add('neon-pulse');
    
    // 随机颜色和延迟
    const color = beamColors[Math.floor(Math.random() * beamColors.length)];
    const delay = Math.random() * 8;
    
    pulse.style.setProperty('--neon-color', color);
    pulse.style.animationDelay = `${delay}s`;
    
    flashContainer.appendChild(pulse);
  }
  
  // 创建霓虹区域
  const areaCount = 10;
  for (let i = 0; i < areaCount; i++) {
    const area = document.createElement('div');
    area.classList.add('neon-area');
    
    // 随机属性
    const size = Math.random() * 300 + 100; // 100-400px
    const color = beamColors[Math.floor(Math.random() * beamColors.length)];
    const delay = Math.random() * 4;
    
    area.style.width = `${size}px`;
    area.style.height = `${size}px`;
    area.style.left = `${Math.random() * 100}vw`;
    area.style.top = `${Math.random() * 100}vh`;
    area.style.transform = 'translate(-50%, -50%)';
    area.style.setProperty('--neon-color', color);
    area.style.animationDelay = `${delay}s`;
    
    flashContainer.appendChild(area);
  }
  
  // 创建霓虹光线
  const rayCount = 20;
  for (let i = 0; i < rayCount; i++) {
    const ray = document.createElement('div');
    ray.classList.add('neon-ray');
    
    // 随机属性
    const length = Math.random() * 100 + 50; // 50-150px
    const angle = Math.random() * 360; // 0-360度
    const color = beamColors[Math.floor(Math.random() * beamColors.length)];
    const delay = Math.random() * 3;
    
    ray.style.width = `${length}px`;
    ray.style.left = `${Math.random() * 100}vw`;
    ray.style.top = `${Math.random() * 100}vh`;
    ray.style.transform = `rotate(${angle}deg)`;
    ray.style.setProperty('--neon-color', color);
    ray.style.animationDelay = `${delay}s`;
    
    flashContainer.appendChild(ray);
  }
  
  // 定期更新一些霓虹元素，保持效果新鲜
  setInterval(() => {
    // 随机更新一部分霓虹光束
    const beams = flashContainer.querySelectorAll('.neon-beam');
    const randomBeams = Array.from(beams).sort(() => 0.5 - Math.random()).slice(0, 3);
    
    randomBeams.forEach(beam => {
      const color = beamColors[Math.floor(Math.random() * beamColors.length)];
      beam.style.color = color;
      beam.style.animation = 'none';
      beam.offsetHeight; // 触发重绘
      beam.style.animation = `beam-flash 5s infinite ${Math.random() * 5}s`;
    });
    
    // 随机更新一部分霓虹光线
    const rays = flashContainer.querySelectorAll('.neon-ray');
    const randomRays = Array.from(rays).sort(() => 0.5 - Math.random()).slice(0, 5);
    
    randomRays.forEach(ray => {
      const color = beamColors[Math.floor(Math.random() * beamColors.length)];
      const angle = Math.random() * 360;
      ray.style.setProperty('--neon-color', color);
      ray.style.transform = `rotate(${angle}deg)`;
    });
  }, 10000); // 每10秒更新一次
}

// 创建烟花效果
function createFirework(x, y) {
  const container = document.getElementById('fireworks-container');
  if (!container) return; // 确保容器存在
  
  const particleCount = 60; // 进一步增加粒子数量
  const colors = [
    'hsl(0, 100%, 50%)',    // 红
    'hsl(45, 100%, 50%)',   // 橙
    'hsl(60, 100%, 50%)',   // 黄
    'hsl(120, 100%, 50%)',  // 绿
    'hsl(240, 100%, 50%)',  // 蓝
    'hsl(300, 100%, 50%)'   // 紫
  ];
  const fireworkColor = colors[Math.floor(Math.random() * colors.length)];
  
  // 创建粒子
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.classList.add('firework-particle');
    
    // 随机角度和距离
    const angle = (i / particleCount) * Math.PI * 2 + (Math.random() * 0.1 - 0.05); // 添加一些随机性
    const distance = Math.random() * 200 + 150; // 进一步增加爆炸范围
    const duration = Math.random() * 1.2 + 1.0; // 增加持续时间
    
    // 设置样式 - 确保粒子可见性
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.backgroundColor = fireworkColor;
    particle.style.width = '4px'; // 进一步增加粒子大小
    particle.style.height = '4px';
    particle.style.borderRadius = '50%'; // 确保是圆形
    particle.style.opacity = '1'; // 初始透明度
    particle.style.boxShadow = `0 0 10px ${fireworkColor}, 0 0 20px ${fireworkColor}, 0 0 30px ${fireworkColor}`; // 增强发光效果
    particle.style.setProperty('--particle-distance', distance);
    particle.style.transformOrigin = `${x}px ${y}px`;
    particle.style.transform = `rotate(${angle}rad) scale(0)`; // 初始缩放为0
    particle.style.position = 'absolute'; // 确保绝对定位
    
    // 设置动画 - 修复动画逻辑
    particle.style.animation = `firework-explode ${duration}s ease-out forwards`;
    
    container.appendChild(particle);
    
    // 动画结束后移除粒子
    setTimeout(() => {
      if (container && container.contains(particle)) {
        container.removeChild(particle);
      }
    }, duration * 1000);
  }
}

// 增强姓名元素，添加更明显的流星效果
function enhanceNameElement(element) {
  // 移除可能导致框体的样式
  element.style.background = 'none';
  element.style.border = 'none';
  element.style.outline = 'none';
  element.style.boxShadow = 'none'; // 移除框体阴影，只保留文字发光
  
  // 确保在动画中期触发烟花
  const duration = parseFloat(element.style.animationDuration);
  const delay = parseFloat(element.style.animationDelay);
  
  // 性能优化：使用requestAnimationFrame跟踪元素位置
  let checkPosition = () => {
    if (!document.contains(element)) return;
    
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // 检查元素是否接近屏幕中心
    const screenCenterX = window.innerWidth / 2;
    const screenCenterY = window.innerHeight / 2;
    const distanceToCenter = Math.sqrt(
      Math.pow(centerX - screenCenterX, 2) + 
      Math.pow(centerY - screenCenterY, 2)
    );
    
    // 如果元素在中心区域附近，触发烟花
    if (distanceToCenter < window.innerWidth / 4) {
      createFirework(centerX, centerY);
      return; // 只触发一次烟花
    }
    
    // 继续检查，直到元素离开屏幕或触发烟花
    requestAnimationFrame(checkPosition);
  };
  
  setTimeout(() => {
    checkPosition();
  }, delay * 1000);
}

// 增强鼠标交互，添加点击触发烟花
// 创建点击粒子效果
function createClickParticles(x, y) {
  const container = document.getElementById('name-container');
  
  // 粒子数量
  const particleCount = 40;
  
  // 粒子颜色
  const particleColors = [
    'hsl(0, 100%, 50%)',    // 红
    'hsl(45, 100%, 50%)',   // 橙
    'hsl(60, 100%, 50%)',   // 黄
    'hsl(120, 100%, 50%)',  // 绿
    'hsl(240, 100%, 50%)',  // 蓝
    'hsl(300, 100%, 50%)',  // 紫
    'hsl(330, 100%, 50%)'   // 粉
  ];
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    
    // 设置粒子样式
    particle.style.position = 'absolute';
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.width = `${Math.random() * 4 + 2}px`;
    particle.style.height = `${Math.random() * 4 + 2}px`;
    particle.style.borderRadius = '50%';
    particle.style.pointerEvents = 'none';
    
    // 随机颜色和发光效果
    const color = particleColors[Math.floor(Math.random() * particleColors.length)];
    particle.style.backgroundColor = color;
    particle.style.boxShadow = `0 0 6px ${color}, 0 0 12px ${color}`;
    
    // 添加到容器
    container.appendChild(particle);
    
    // 随机发射角度和距离
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 80 + 30;
    const velocityX = Math.cos(angle) * distance;
    const velocityY = Math.sin(angle) * distance;
    
    // 随机动画持续时间
    const duration = Math.random() * 0.5 + 0.8;
    
    // 使用关键帧动画实现粒子效果
    const keyframes = [
      { opacity: 1, transform: 'translate(0, 0) scale(1)' },
      { opacity: 0.7, transform: `translate(${velocityX * 0.7}px, ${velocityY * 0.7}px) scale(0.8)` },
      { opacity: 0.3, transform: `translate(${velocityX * 0.9}px, ${velocityY * 0.9}px) scale(0.6)` },
      { opacity: 0, transform: `translate(${velocityX}px, ${velocityY}px) scale(0.3)` }
    ];
    
    particle.animate(keyframes, {
      duration: duration * 1000,
      easing: 'cubic-bezier(0.17, 0.55, 0.55, 1)',
      fill: 'forwards'
    });
    
    // 动画结束后移除粒子
    setTimeout(() => {
      if (container.contains(particle)) {
        container.removeChild(particle);
      }
    }, duration * 1000);
  }
}

function enhanceInteractions() {
  const container = document.getElementById('name-container');
  
  // 点击触发烟花和粒子效果
  container.addEventListener('click', function(e) {
    createFirework(e.clientX, e.clientY);
    createClickParticles(e.clientX, e.clientY);
    
    // 原有点击添加姓名的逻辑，增加数量使效果更明显
    const namesToAdd = Math.floor(Math.random() * 3) + 2; // 2-4个姓名
    for (let i = 0; i < namesToAdd; i++) {
      const randomName = familyNames[Math.floor(Math.random() * familyNames.length)];
      const element = createNameElement(randomName);
      // 添加一点随机偏移，避免姓名重叠
      element.style.transform += ` translate(${Math.random() * 20 - 10}px, ${Math.random() * 20 - 10}px)`;
      container.appendChild(element);
      enhanceNameElement(element);
    }
  });
  
  // 移动端触摸触发烟花和粒子效果
  container.addEventListener('touchstart', function(e) {
    const touch = e.touches[0];
    createFirework(touch.clientX, touch.clientY);
    createClickParticles(touch.clientX, touch.clientY);
    
    // 触摸时添加多个姓名
    const namesToAdd = Math.floor(Math.random() * 3) + 2; // 2-4个姓名
    for (let i = 0; i < namesToAdd; i++) {
      const randomName = familyNames[Math.floor(Math.random() * familyNames.length)];
      const element = createNameElement(randomName);
      element.style.transform += ` translate(${Math.random() * 20 - 10}px, ${Math.random() * 20 - 10}px)`;
      container.appendChild(element);
      enhanceNameElement(element);
    }
  });
}

// 定期随机触发烟花，特别是在屏幕中心区域
function startRandomFireworks() {
  // 更频繁地触发烟花，从2秒改为1秒
  setInterval(() => {
    // 让烟花更集中在屏幕中心区域
    const centerBias = 0.6; // 中心区域权重
    const edgeBias = 0.4; // 边缘区域权重
    
    let x, y;
    if (Math.random() < centerBias) {
      // 中心区域 (30% - 70% 的屏幕范围)
      x = window.innerWidth * 0.3 + Math.random() * window.innerWidth * 0.4;
      y = window.innerHeight * 0.3 + Math.random() * window.innerHeight * 0.4;
    } else {
      // 随机区域
      x = Math.random() * window.innerWidth;
      y = Math.random() * window.innerHeight;
    }
    
    createFirework(x, y);
  }, 1000); // 每1秒随机触发一次烟花
}

// 创建底部中心光线效果
function createBottomBeamEffect() {
  // 确保容器存在
  let beamContainer = document.querySelector('.bottom-beam-container');
  if (!beamContainer) {
    beamContainer = document.createElement('div');
    beamContainer.classList.add('bottom-beam-container');
    document.body.appendChild(beamContainer);
  }
  
  // 创建主光束 - 优化为更像烟花发射的效果
  function createMainBeam() {
    // 创建多个光束，模拟烟花发射轨迹
    const beamCount = Math.floor(Math.random() * 3) + 1; // 1-3个光束
    const beams = [];
    
    for (let i = 0; i < beamCount; i++) {
      const beam = document.createElement('div');
      beam.classList.add('center-beam');
      
      // 创建烟花效果所需的多种颜色
      const fireworkColors = [
        'hsl(0, 100%, 60%)',    // 红
        'hsl(30, 100%, 60%)',   // 橙
        'hsl(60, 100%, 60%)',   // 黄
        'hsl(120, 100%, 60%)',  // 绿
        'hsl(210, 100%, 60%)',  // 蓝
        'hsl(270, 100%, 60%)',  // 紫
        'hsl(330, 100%, 60%)'   // 粉
      ];
      
      // 随机颜色，模拟烟花的多彩效果
      const randomColor = fireworkColors[Math.floor(Math.random() * fireworkColors.length)];
      beam.style.backgroundColor = randomColor;
      
      // 烟花特征：增强发光效果，使光束更像烟花发射轨迹
      beam.style.boxShadow = `0 0 15px ${randomColor}, 0 0 30px ${randomColor}, 0 0 45px ${randomColor}`;
      
      // 随机光束粗细，增加变化感
      const beamWidth = Math.random() * 3 + 2; // 2-5px
      beam.style.width = `${beamWidth}px`;
      
      // 烟花特征：多条光束有轻微角度偏移
      const angleOffset = (i - Math.floor(beamCount / 2)) * (Math.random() * 2 + 1); // -3px 到 3px
      beam.style.transform = `translateX(-50%) rotate(${angleOffset}deg)`;
      
      // 轻微抖动效果，使光束看起来更自然
      const jitterAmount = 4;
      let jitterInterval;
      
      // 随机延迟，使效果更自然
      const delay = Math.random() * 0.2 + (i * 0.05); // 光束依次发射
      beam.style.animationDelay = `${delay}s`;
      
      beamContainer.appendChild(beam);
      beams.push({
        element: beam,
        jitterInterval,
        beamWidth
      });
      
      // 使用requestAnimationFrame优化抖动效果
      let lastTime = 0;
      let jitterDirection = 1;
      let currentJitter = 0;
      
      function jitter(timestamp) {
        if (!document.contains(beam)) return;
        
        if (!lastTime) lastTime = timestamp;
        const deltaTime = timestamp - lastTime;
        
        // 每隔50ms更新一次抖动
        if (deltaTime > 50) {
          // 创建更自然的抖动模式，模拟不稳定的发射轨迹
          jitterDirection = Math.random() > 0.5 ? jitterDirection : -jitterDirection;
          currentJitter = Math.min(jitterAmount, Math.abs(currentJitter) + (Math.random() * 1.5));
          const jitterX = currentJitter * jitterDirection;
          
          beam.style.transform = `translateX(calc(-50% + ${jitterX}px)) rotate(${angleOffset}deg)`;
          lastTime = timestamp;
        }
        
        requestAnimationFrame(jitter);
      }
      
      // 延迟启动抖动
      setTimeout(() => {
        requestAnimationFrame(jitter);
      }, 200);
      
      // 动画结束后移除光束
      setTimeout(() => {
        if (beamContainer && beamContainer.contains(beam)) {
          // 添加消失动画 - 模拟烟花燃料耗尽
          beam.animate([
            { opacity: 1, width: `${beamWidth}px`, height: '50vh' },
            { opacity: 0.8, width: `${beamWidth * 1.2}px`, height: '45vh' }, // 短暂变宽
            { opacity: 0, width: `${beamWidth * 0.3}px`, height: '30vh' } // 快速收缩消失
          ], {
            duration: 400,
            easing: 'cubic-bezier(0.7, 0, 0.84, 0)',
            fill: 'forwards'
          });
          
          // 延迟移除，等待消失动画完成
          setTimeout(() => {
            if (beamContainer && beamContainer.contains(beam)) {
              beamContainer.removeChild(beam);
            }
          }, 400);
        }
      }, 3000 + (i * 200)); // 总动画时间
    }
    
    // 创建火花效果，增强烟花发射感
    createSparks(beamCount);
    
    return beams;
  }
  
  // 创建发射火花效果
  function createSparks(beamCount) {
    const sparkCount = beamCount * 20;
    
    for (let i = 0; i < sparkCount; i++) {
      const spark = document.createElement('div');
      spark.classList.add('beam-particle');
      
      // 火花特征：更小更亮
      const size = Math.random() * 2 + 1; // 1-3px
      spark.style.width = `${size}px`;
      spark.style.height = `${size}px`;
      
      // 火花从底部向上发射
      spark.style.bottom = '10px';
      spark.style.left = '50%';
      
      // 随机颜色
      const colors = ['hsl(0, 100%, 70%)', 'hsl(30, 100%, 70%)', 'hsl(60, 100%, 70%)'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      spark.style.backgroundColor = color;
      spark.style.boxShadow = `0 0 8px ${color}`;
      
      // 随机发射角度和距离
      const angle = (Math.random() - 0.5) * Math.PI * 0.4; // -36° 到 36°
      const distance = Math.random() * 100 + 50; // 50-150px
      const x = Math.cos(angle) * distance;
      const y = -Math.sin(angle) * distance; // 向上发射
      
      beamContainer.appendChild(spark);
      
      // 随机动画持续时间
      const duration = Math.random() * 0.5 + 0.3; // 0.3-0.8s
      const delay = Math.random() * 0.5; // 0-0.5s 延迟
      
      setTimeout(() => {
        spark.animate([
          { opacity: 0, transform: 'translate(-50%, 0) scale(0)' },
          { opacity: 1, transform: 'translate(-50%, 0) scale(1)' },
          { opacity: 0.7, transform: `translate(calc(-50% + ${x * 0.7}px), ${y * 0.7}px) scale(0.8)` },
          { opacity: 0, transform: `translate(calc(-50% + ${x}px), ${y}px) scale(0.3)` }
        ], {
          duration: duration * 1000,
          easing: 'ease-out',
          fill: 'forwards'
        });
        
        // 动画结束后移除火花
        setTimeout(() => {
          if (beamContainer && beamContainer.contains(spark)) {
            beamContainer.removeChild(spark);
          }
        }, duration * 1000);
      }, delay * 1000);
    }
  }
  
  // 创建爆炸圆形
  function createExplosionCircle() {
    const circle = document.createElement('div');
    circle.classList.add('beam-circle');
    
    // 创建烟花效果所需的多种颜色
    const fireworkColors = [
      'hsl(0, 100%, 50%)',    // 红
      'hsl(30, 100%, 50%)',   // 橙
      'hsl(60, 100%, 50%)',   // 黄
      'hsl(120, 100%, 50%)',  // 绿
      'hsl(210, 100%, 50%)',  // 蓝
      'hsl(270, 100%, 50%)',  // 紫
      'hsl(330, 100%, 50%)'   // 粉
    ];
    
    // 随机颜色，模拟烟花爆炸的多彩效果
    const randomColor = fireworkColors[Math.floor(Math.random() * fireworkColors.length)];
    circle.style.borderColor = randomColor;
    
    // 增强发光效果
    circle.style.boxShadow = `0 0 20px ${randomColor}, 0 0 30px ${randomColor}`;
    
    // 随机大小，增加变化范围
    const size = Math.random() * 200 + 200; // 200-400px
    circle.style.width = `${size}px`;
    circle.style.height = `${size}px`;
    
    // 随机边框粗细
    const borderWidth = Math.random() * 3 + 2; // 2-5px
    circle.style.borderWidth = `${borderWidth}px`;
    
    // 随机透明度
    circle.style.opacity = Math.random() * 0.3 + 0.7; // 0.7-1.0
    
    // 延迟触发，在光束到达中间后
    const delay = 0.6 + Math.random() * 0.3;
    circle.style.animationDelay = `${delay}s`;
    
    beamContainer.appendChild(circle);
    
    // 添加脉动效果，模拟爆炸前的能量积累
    const pulseInterval = setInterval(() => {
      const scale = 0.95 + Math.random() * 0.1;
      circle.style.transform = `translate(-50%, -50%) scale(${scale})`;
    }, 100);
    
    // 动画结束后移除圆形
    setTimeout(() => {
      clearInterval(pulseInterval);
      if (beamContainer && beamContainer.contains(circle)) {
        beamContainer.removeChild(circle);
      }
    }, 2500); // 动画持续时间 + 缓冲
    
    return circle;
  }
  
  // 创建爆炸粒子 - 优化为更像烟花的效果
  function createExplosionParticles() {
    // 性能优化：根据屏幕尺寸调整粒子数量
    const baseParticleCount = 60;
    const screenFactor = (window.innerWidth * window.innerHeight) / (1920 * 1080);
    const particleCount = Math.floor(baseParticleCount * screenFactor);
    
    // 创建烟花效果所需的多种颜色
    const fireworkColors = [
      'hsl(0, 100%, 50%)',    // 红
      'hsl(30, 100%, 50%)',   // 橙
      'hsl(60, 100%, 50%)',   // 黄
      'hsl(120, 100%, 50%)',  // 绿
      'hsl(210, 100%, 50%)',  // 蓝
      'hsl(270, 100%, 50%)',  // 紫
      'hsl(330, 100%, 50%)'   // 粉
    ];
    
    // 性能优化：预创建粒子批次，避免频繁DOM操作
    const particles = [];
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.classList.add('beam-particle');
      particles.push(particle);
    }
    
    // 一次性添加所有粒子到DOM
    particles.forEach(particle => {
      beamContainer.appendChild(particle);
    });
    
    // 为每个粒子设置动画
    particles.forEach((particle, i) => {
      // 随机大小，增加变化范围
      const size = Math.random() * 6 + 2; // 2-8px
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      // 烟花特效：创建多个爆炸波次
      const waveCount = Math.floor(Math.random() * 2) + 1; // 1-2个波次
      const baseAngle = (i / particleCount) * Math.PI * 2;
      
      // 随机添加角度偏移，使爆炸更自然
      const angleVariation = (Math.random() - 0.5) * 0.6;
      const angle = baseAngle + angleVariation;
      
      // 烟花特征：增加爆炸范围和速度变化
      const distance = Math.random() * 300 + 200; // 200-500px，更大范围
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      
      // 随机动画参数，使爆炸效果更自然
      const particleDuration = Math.random() * 0.7 + 1.3; // 1.3-2.0s
      const startOffset = Math.random() * 0.15; // 更大的随机起始偏移
      
      // 烟花特征：添加二次爆炸效果
      const hasSecondaryBurst = Math.random() > 0.7; // 30%概率有二次爆炸
      
      // 随机颜色，模拟烟花的多彩效果
      const randomColor = fireworkColors[Math.floor(Math.random() * fireworkColors.length)];
      particle.style.backgroundColor = randomColor;
      particle.style.boxShadow = `0 0 15px ${randomColor}, 0 0 30px ${randomColor}, 0 0 45px ${randomColor}`; // 增强发光效果
      
      // 设置粒子爆炸的具体动画
      particle.style.left = '50%';
      particle.style.top = '50%';
      particle.style.animation = 'none'; // 移除默认动画
      particle.style.position = 'absolute';
      particle.style.borderRadius = '50%';
      
      // 随机延迟，使爆炸效果更自然
      const delay = 0.5 + Math.random() * 0.4;
      
      setTimeout(() => {
        // 使用requestAnimationFrame优化性能
        requestAnimationFrame(() => {
          // 使用关键帧动画实现更逼真的烟花爆炸效果
          const keyframes = [
            { opacity: 0, transform: 'translate(-50%, -50%) scale(0)' },
            { 
              opacity: 1, 
              transform: 'translate(-50%, -50%) scale(1.2)', // 更大的初始爆炸
              offset: 0.1 + startOffset
            },
            { 
              opacity: 0.8, 
              transform: `translate(calc(-50% + ${x * 0.6}px), calc(-50% + ${y * 0.6}px)) scale(0.9)`,
              offset: 0.3 + startOffset
            },
            { 
              opacity: 0.6, 
              transform: `translate(calc(-50% + ${x * 0.8}px), calc(-50% + ${y * 0.8}px)) scale(0.7)`,
              offset: 0.6 + startOffset
            },
            { 
              opacity: 0, 
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(0.3)`,
              offset: 1
            }
          ];
          
          particle.animate(keyframes, {
            duration: particleDuration * 1000,
            easing: 'cubic-bezier(0.1, 0.7, 0.8, 0.9)', // 更像烟花的缓动函数
            fill: 'forwards'
          });
          
          // 添加闪烁效果，模拟烟花的明暗变化
          let flickerCount = 0;
          const maxFlickers = 3;
          
          function flicker() {
            if (flickerCount >= maxFlickers) return;
            
            const opacity = 0.6 + Math.random() * 0.4;
            particle.style.opacity = opacity;
            
            flickerCount++;
            setTimeout(flicker, Math.random() * 100 + 80);
          }
          
          // 开始闪烁效果
          flicker();
          
          // 二次爆炸效果
          if (hasSecondaryBurst) {
            setTimeout(() => {
              // 创建小型二次爆炸粒子
              const secondaryParticles = 3;
              const secondaryColors = fireworkColors.filter(c => c !== randomColor);
              
              for (let j = 0; j < secondaryParticles; j++) {
                const secondaryParticle = document.createElement('div');
                secondaryParticle.classList.add('beam-particle');
                
                const currentRect = particle.getBoundingClientRect();
                const containerRect = beamContainer.getBoundingClientRect();
                
                secondaryParticle.style.left = `${currentRect.left - containerRect.left + currentRect.width / 2}px`;
                secondaryParticle.style.top = `${currentRect.top - containerRect.top + currentRect.height / 2}px`;
                secondaryParticle.style.width = `${Math.random() * 2 + 1}px`;
                secondaryParticle.style.height = `${Math.random() * 2 + 1}px`;
                secondaryParticle.style.backgroundColor = secondaryColors[Math.floor(Math.random() * secondaryColors.length)];
                secondaryParticle.style.borderRadius = '50%';
                secondaryParticle.style.position = 'absolute';
                
                beamContainer.appendChild(secondaryParticle);
                
                const secondaryAngle = (j / secondaryParticles) * Math.PI * 2;
                const secondaryDistance = Math.random() * 20 + 10;
                const secondaryX = Math.cos(secondaryAngle) * secondaryDistance;
                const secondaryY = Math.sin(secondaryAngle) * secondaryDistance;
                
                secondaryParticle.animate([
                  { opacity: 0, transform: 'translate(-50%, -50%) scale(0)' },
                  { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
                  { opacity: 0, transform: `translate(calc(-50% + ${secondaryX}px), calc(-50% + ${secondaryY}px)) scale(0.5)` }
                ], {
                  duration: 600 + Math.random() * 400,
                  easing: 'ease-out',
                  fill: 'forwards'
                });
                
                setTimeout(() => {
                  if (beamContainer.contains(secondaryParticle)) {
                    beamContainer.removeChild(secondaryParticle);
                  }
                }, 1000);
              }
            }, particleDuration * 400); // 在主爆炸中期触发二次爆炸
          }
        });
      }, delay * 1000);
      
      // 动画结束后移除粒子
      setTimeout(() => {
        if (beamContainer && beamContainer.contains(particle)) {
          beamContainer.removeChild(particle);
        }
      }, (delay + 2.5) * 1000); // 总动画时间
    });
  }
  
  // 组合动画效果
  function playBeamSequence() {
    createMainBeam();
    createExplosionCircle();
    createExplosionParticles();
  }
  
  // 立即播放一次
  playBeamSequence();
  
  // 设置定时器，定期播放光束效果（每8-12秒）
  setInterval(() => {
    playBeamSequence();
  }, Math.random() * 4000 + 8000);
}

// 增强的初始化函数 - 性能优化版本
function enhancedInit() {
  // 性能优化：延迟加载非关键组件
  requestAnimationFrame(() => {
    // 确保烟花容器存在
    let fireworksContainer = document.getElementById('fireworks-container');
    if (!fireworksContainer) {
      fireworksContainer = document.createElement('div');
      fireworksContainer.id = 'fireworks-container';
      document.body.appendChild(fireworksContainer);
    }
    
    // 优化顺序：先初始化核心功能
    init(); // 调用原有的初始化
    
    // 延迟添加其他效果，避免页面卡顿
    setTimeout(() => {
      createNeonLines();
      enhanceInteractions();
      
      // 延迟添加重效果
      setTimeout(() => {
        createNeonFlashes();
        createBottomBeamEffect();
        
        // 立即触发一些烟花，确保能看到效果
        setTimeout(() => {
          // 初始时在中心区域触发几个烟花
          for (let i = 0; i < 3; i++) {
            const x = window.innerWidth / 2 + (Math.random() - 0.5) * 200;
            const y = window.innerHeight / 2 + (Math.random() - 0.5) * 200;
            createFirework(x, y);
          }
          
          // 开始定期随机触发烟花
          startRandomFireworks();
        }, 500);
      }, 300);
    }, 200);
    
    // 监听姓名元素添加到DOM - 优化为批量处理
    const observer = new MutationObserver((mutations) => {
      // 收集所有需要增强的元素，一次性处理
      const elementsToEnhance = [];
      
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.classList && node.classList.contains('name-element')) {
            elementsToEnhance.push(node);
          }
        });
      });
      
      // 批量处理元素增强
      if (elementsToEnhance.length > 0) {
        elementsToEnhance.forEach(element => {
          enhanceNameElement(element);
        });
      }
    });
    
    observer.observe(document.getElementById('name-container'), {
      childList: true
    });
    
    // 添加性能监控，在页面不可见时暂停动画
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (trailsAnimationFrame) {
          cancelAnimationFrame(trailsAnimationFrame);
        }
        // 可以在这里暂停其他动画
      } else {
        // 恢复动画
        updateTrails();
      }
    });
  });
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', enhancedInit);