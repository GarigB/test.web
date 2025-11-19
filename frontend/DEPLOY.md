# Odo Deployment заавар

## Бэлтгэл

1. **Odo суулгах** (хэрэв суусан бол алгасах):
```bash
curl -fsSL https://mirror.openshift.com/pub/openshift-v4/clients/odo/latest/odo-linux-amd64 -o /tmp/odo
chmod +x /tmp/odo
sudo mv /tmp/odo /usr/local/bin/odo
```

2. **OpenShift/Kubernetes кластерт холбогдох**:
```bash
odo login <cluster-url>
```

Эсвэл **Podman ашиглах**:
```bash
odo deploy --platform podman
```

## Deployment хийх

```bash
cd frontend
odo deploy
```

## Devfile мэдээлэл

- **Нэр**: frontend
- **Төрөл**: Node.js/Next.js
- **Port**: 3000
- **Build command**: `npm install && npm run build`
- **Run command**: `npm start`

## Анхаарах зүйлс

- Кластер эсвэл Podman шаардлагатай
- Devfile.yaml файл бэлэн байна
- Next.js production build хийгдэнэ
