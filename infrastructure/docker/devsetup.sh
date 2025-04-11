docker pull mongodb/mongodb-community-server:latest
docker run --name mongodb -p 27017:27017 -d mongodb/mongodb-community-server:latest
# mongodb://<USER>:<PASSWORD>@<HOST>:<PORT>/<DATABASE>?authSource=admin&directConnection=true
# postgresql://other@localhost/otherdb?connect_timeout=10&application_name=myapp
# pnpm --filter=crm exec npx @snaplet/seed init prisma/seed
# "seed": "ts-node prisma/seed/seed.ts"
# postgresql://fielduser:Yarn@2021@localhost/crm_db?connect_timeout=10&application_name=cc
# mongodb://localhost:27017/services?authSource=admin&directConnection=true