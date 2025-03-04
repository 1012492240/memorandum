# 构建阶段
FROM --platform=linux/amd64 node:18-alpine AS builder

# 添加构建参数
ARG NEXT_PUBLIC_VAPID_PUBLIC_KEY
ARG VAPID_PRIVATE_KEY

WORKDIR /app

# 安装构建依赖
RUN apk add --no-cache git python3 make g++

# 设置镜像源和核心包
RUN npm config set registry https://registry.npmmirror.com
RUN corepack enable && corepack prepare pnpm@latest --activate

# 复制依赖文件
COPY package*.json ./
COPY prisma ./prisma/

# 安装依赖
RUN npm install --production=false

# 复制源代码
COPY . .

# 生成Prisma客户端
RUN npx prisma generate

# 构建应用
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build

# 生产阶段
FROM --platform=linux/amd64 node:18-alpine AS runner

WORKDIR /app

# 创建非root用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs

# 设置环境变量
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=512"

# 复制必要文件
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/next.config.mjs ./
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# 切换用户
USER nextjs

# 健康检查
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl --fail http://localhost:3000/api/health || exit 1

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["npm", "start"]
