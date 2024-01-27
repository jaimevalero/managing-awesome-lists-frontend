 cp -f  ~/git/managing-awesome-lists/var/awesome/* ~/git/managing-awesome-lists-frontend/public/awesome/
  cp -f  ~/git/managing-awesome-lists/var/topic/* ~/git/managing-awesome-lists-frontend/public/topic/

npm run build
nuxt build
