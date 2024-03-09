FROM oven/bun:1 as base
WORKDIR /app

#Install deps
FROM base AS install
RUN mkdir -p /temp
COPY package.json bun.lockb /temp/
RUN cd /temp && bun install --frozen-lockfile

FROM base AS prerelease
COPY --from=install /temp/node_modules node_modules
COPY . .

RUN chown -R bun /app/node_modules

#Build
RUN bun run build 

# run the app
USER bun
EXPOSE 80/tcp
ENTRYPOINT [ "bun", "run", "start:prod" ]