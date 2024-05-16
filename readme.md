# Logging Websocket Mailer

### Delivery

1. Mengimplementasikan debugging dan logging menggunakan sentry untuk mencatat error didalam aplikasi
2. Menerapkan fitur real-time notifikasi sebagai welcome notif dan update password
3. Menerapkan mailer untuk fitur lupa password

### Criteria

1. Mengimplementasikan Debugging & Logging (30 points)
2. Mengimplementasikan Real-Time Communication (40 points)
3. Mampu menggunakan fitur mailer (30 points)

<hr>

## Usage

Gunakan tautan di bawah ini dari Auth Url sampai Mail Url.

### Main Url

```
https://km6-loggingwebsocketmailer-rfn-production.up.railway.app
```

<hr>

### Auth Url

#### 1. Register 
Register dengan memasukan nama, email, dan password

```
https://km6-loggingwebsocketmailer-rfn-production.up.railway.app/register
```

#### 2. Login 
Login menggunakan email dan password

```
https://km6-loggingwebsocketmailer-rfn-production.up.railway.app/login
```

#### 3. Dashboard
untuk mengakses dashboard diperlukan query token melalui url login

```
https://km6-loggingwebsocketmailer-rfn-production.up.railway.app/dashboard?token=123123123
```

<hr>

### Mail Url

#### 1. Forgot Password
masukan email yang sudah terdaftar pada database

```
https://km6-loggingwebsocketmailer-rfn-production.up.railway.app/forgot-password
```

#### 2. Verify Email
untuk verify email diperlukan query token yang didapat melalui url dashboard

```
https://km6-loggingwebsocketmailer-rfn-production.up.railway.app/request-verify?token=123123123
```
