//inicia o projeto Next.js dentro de frontend
npx create-next-app@latest frontend

//rodar projet
npm run dev 


//inicia o projeto node.js 
//
npm init -y

//instalar framework Express
npm install express
npm install -D nodemon //reinicia o servidor automaticamente quando fazes alterações (equivalente ao hot reload do Next.js)

//faz com que consigamos rodar npm run dev e rode o front e o back ao mesmo tempo
npm init -y //fazer na raiz do projeto
npm install concurrently --save-dev // é um pacote que permite correr múltiplos comandos em paralelo num só terminal

"scripts": {
  "frontend": "npm run dev --prefix frontend",
  "backend": "npm run dev --prefix backend",
  "dev": "concurrently \"npm run frontend\" \"npm run backend\""
},

--prefix frontend — diz ao npm para correr o comando dentro da pasta frontend/ sem teres de entrar lá
--prefix backend — mesmo para o backend
concurrently — corre os dois ao mesmo tempo num só terminal


//criar a base de dados postgres
npm install pg
.env //file para guardar a connection string

dbpassword: postgresql://neondb_owner:npg_IVt96qKexHTw@ep-floral-meadow-abcavbkg.eu-west-2.aws.neon.tech/neondb?sslmode=require
