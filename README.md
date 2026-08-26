# Login con Apple y Google


## 1. Dependencias

```bash
npx expo install expo-apple-authentication @react-native-google-signin/google-signin
```

En `app.json`, dentro de `expo`:

```json
"ios": {
  "usesAppleSignIn": true,
  "bundleIdentifier": "com.jacarandalab.catrineando"
},
"plugins": [
  "expo-apple-authentication",
  ["@react-native-google-signin/google-signin", {
    "iosUrlScheme": "com.googleusercontent.apps.TU_ID_INVERTIDO"
  }]
]
```

El `iosUrlScheme` sale del `.plist` que descargas al crear el cliente iOS —
es el `REVERSED_CLIENT_ID`.

## 2. Google Cloud — tres clientes OAuth

Esta es la parte que más se atora. En `console.cloud.google.com/apis/credentials`
del proyecto de Catrineando (no el de NearYou), crea **tres** IDs de cliente:

| Tipo | Para qué |
|---|---|
| **Aplicación web** | El que va en Supabase y en `webClientId`. Sin este nada funciona. |
| **Android** | Necesita el package name y el SHA-1 de tu keystore. |
| **iOS** | Necesita el bundle identifier. De aquí sale el `iosUrlScheme`. |

El SHA-1 de desarrollo:

```bash
keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

Para producción con EAS, el de verdad lo da `eas credentials`. **Si no registras
el SHA-1 de producción, el login funciona en tu máquina y falla en la tienda** —
error clásico y difícil de diagnosticar porque Google solo devuelve
`DEVELOPER_ERROR` sin explicación.

Luego en `.env`:

```
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=xxxx.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=yyyy.apps.googleusercontent.com
```

Ojo: `webClientId` es el de tipo **web**, no el de Android. Poner el de Android
ahí es el error número uno con esta librería.

## 3. Apple Developer

1. En `developer.apple.com` → Identifiers → tu App ID → activa **Sign In with Apple**.
2. Crea un **Services ID** y una **Key** para Sign in with Apple.
3. Con la Key descargada (.p8) llena el provider de Apple en Supabase.

## 4. Supabase

Authentication → Providers:

- **Google**: pega el *web* client ID y su secret.
- **Apple**: pega el Services ID, Team ID, Key ID y el contenido del .p8.

En Authentication → URL Configuration, agrega el esquema de la app a las redirect
URLs: `com.jacarandalab.catrineando://`

## 5. Desplegar y compilar

```bash
npx supabase db push
npx supabase functions deploy transferir-creditos
npx expo prebuild --clean
npx expo run:ios      # y run:android
```

## 6. Enganchar en la app

En `_layout.tsx`, junto a `asegurarSesion()`:

```tsx
import { configurarGoogle } from '../services/authService';
useEffect(() => {
  configurarGoogle();
  asegurarSesion();
}, []);
```

Y donde vayas a mostrarlo:

```tsx
const [login, setLogin] = useState(false);
<LoginSheet
  visible={login}
  onClose={() => setLogin(false)}
  onSuccess={() => {/* refrescar saldo */}}
  motivo="Crea tu cuenta para comprar créditos y no perderlos nunca."
/>
```

**No lo muestres al abrir la app.** Obligar a registrarse antes de ver el
producto mata la conversión. El momento correcto es justo antes de comprar, y
opcionalmente un aviso suave después de la primera catrina generada.

## 7. Probar la transferencia (el caso que importa)

1. Instala limpio → se crea sesión anónima con 1 crédito gratis.
2. Regálate créditos en el SQL Editor: `select otorgar_creditos('UUID_ANON', 'test-9', 'catrinas_5', 5, 'test');`
3. Genera una catrina (saldo 5).
4. Inicia sesión con Google.
5. Verifica: `select * from creditos where user_id = 'UUID_NUEVO';` → debe decir 5.
6. La cuenta anónima ya no debe existir en `auth.users`.

Si el saldo llega en cero, revisa los logs de `transferir-creditos`.

## Requisito obligatorio de Apple

Si ofreces login con Google en iOS, **Apple exige** que también ofrezcas Sign in
with Apple. No es opcional: rechazan la app en revisión. Por eso el botón de
Apple aparece primero y solo en iOS.

## Nota sobre el email de Apple

Muchos usuarios eligen "Ocultar mi correo" y Apple manda un alias
`@privaterelay.appleid.com`. Funciona para todo, pero si algún día mandas correos
de soporte, ten en cuenta que ese alias deja de funcionar si el usuario borra la
app y revoca el acceso.