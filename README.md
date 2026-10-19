# Publicación web en OCI con Nginx y DuckDNS

**Estudiante:** David Santiago Camacho Villamil - Erick Leandro Criollo Marulanda
**Asignatura:** Cloud Computing 2026-2 · Uniempresarial
**Sitio publicado:** http://SUBDOMINIO.duckdns.org

> Esta guía reutiliza la red creada en el Taller 1 (`red-infraestructura`, `subred-web`, puertos 22 y 80 abiertos) y crea una **máquina virtual nueva** para publicar una página web propia con Nginx y un subdominio de DuckDNS.

## Tabla de contenido

1. [Crear la nueva máquina virtual](#1-crear-la-nueva-máquina-virtual)
2. [Conectarse por SSH desde Cloud Shell](#2-conectarse-por-ssh-desde-cloud-shell)
3. [Instalar Nginx](#3-instalar-nginx)
4. [Abrir el puerto 80 en el firewall de la VM](#4-abrir-el-puerto-80-en-el-firewall-de-la-vm)
5. [Publicar la página web propia](#5-publicar-la-página-web-propia)
6. [Configurar el subdominio en DuckDNS](#6-configurar-el-subdominio-en-duckdns)
7. [Pruebas desde un navegador externo](#7-pruebas-desde-un-navegador-externo)

---

## Requisitos previos

| Recurso | Valor |
|---|---|
| Región | Brazil East (São Paulo) |
| Compartimento | `Infraestructura_y_Cloud` |
| Red virtual (VCN) | `red-infraestructura` (10.0.0.0/16) |
| Subred pública | `subred-web` (10.0.0.0/24) |
| Reglas de entrada | TCP 22 (SSH) y TCP 80 (HTTP) desde `0.0.0.0/0` |

---

## 1. Crear la nueva máquina virtual

1. En la consola de OCI abrir **Compute > Instances** y seleccionar el compartimento `Infraestructura_y_Cloud`.
2. Pulsar **Create instance** y completar:

| Campo | Valor |
|---|---|
| Name | `servidor-taller` |
| Compartment | `Infraestructura_y_Cloud` |
| Image | Oracle Linux 9 |
| Shape | `VM.Standard.E4.Flex` (o `E5.Flex`): 1 OCPU, 2 GB de memoria |
| VCN | `red-infraestructura` |
| Subnet | `subred-web` |
| Public IPv4 address | Activada |

3. En **Add SSH keys** seleccionar **Generate a key pair for me**, descargar la llave privada y renombrarla `llave-taller.key`.
4. Pulsar **Create** y esperar el estado **Running**.
5. Copiar la **IP pública** de la instancia: `IP_PUBLICA`.

![Paso 1 - Formulario de creación](capturas/01-crear-vm.png)
![Paso 1 - Instancia en Running](capturas/02-vm-running.png)

---

## 2. Conectarse por SSH desde Cloud Shell

1. En la barra superior de OCI abrir **Cloud Shell** y elegir la red **Public Network**.
2. En el menú de Cloud Shell, usar **Upload** para subir `llave-taller.key`.
3. Ejecutar:

```bash
chmod 600 ~/llave-taller.key
ssh -i ~/llave-taller.key opc@IP_PUBLICA
whoami
```

Escribir `yes` cuando pregunte por la huella del servidor. `whoami` debe responder `opc`.

![Paso 2 - Conexión SSH](capturas/03-ssh.png)

---

## 3. Instalar Nginx

```bash
sudo dnf install -y nginx git
sudo systemctl enable --now nginx
sudo systemctl status nginx
```

El estado debe aparecer como **active (running)**. Salir del status con `q`.

![Paso 3 - Nginx activo](capturas/04-nginx-status.png)

---

## 4. Abrir el puerto 80 en el firewall de la VM

Además de la Security List de OCI, Oracle Linux tiene su propio firewall (`firewalld`) que bloquea HTTP.

```bash
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --reload
sudo firewall-cmd --list-services
```

La lista debe incluir `http`. Abrir `http://IP_PUBLICA` en el navegador: debe aparecer la página de prueba de Nginx.

![Paso 4 - Página por defecto de Nginx](capturas/05-welcome-nginx.png)

---

## 5. Publicar la página web propia

La página tiene 4 secciones (Inicio, Sobre mí, Proyectos, Contacto), imágenes, CSS adaptable a móviles (`@media`) y funcionalidades en JavaScript (menú hamburguesa, modo oscuro, texto animado, contadores, filtro de proyectos y validación del formulario). Está en la carpeta `sitio/` de este repositorio:

```
sitio/
├── index.html
├── styles.css
├── script.js
└── img/
```

En la VM, clonar este repositorio y copiar la página a la carpeta que sirve Nginx:

```bash
git clone https://github.com/USUARIO/REPOSITORIO.git
sudo rm -rf /usr/share/nginx/html/*
sudo cp -r REPOSITORIO/sitio/* /usr/share/nginx/html/
sudo restorecon -Rv /usr/share/nginx/html
ls -la /usr/share/nginx/html
```

`restorecon` aplica la etiqueta de SELinux correcta a los archivos; sin ese paso Nginx puede responder **403 Forbidden**.

Recargar `http://IP_PUBLICA`.

![Paso 5 - Archivos copiados](capturas/06-archivos.png)
![Paso 5 - Página publicada por IP](capturas/07-pagina-ip.png)

---

## 6. Configurar el subdominio en DuckDNS

1. Ingresar a https://www.duckdns.org e iniciar sesión (Google o GitHub).
2. En **sub domain** escribir `SUBDOMINIO` y pulsar **add domain**.
3. En **current ip** escribir `IP_PUBLICA` y pulsar **update ip**.
4. Verificar la resolución desde el PC:

```bash
nslookup SUBDOMINIO.duckdns.org
```

La respuesta debe mostrar `IP_PUBLICA`.

![Paso 6 - Subdominio en DuckDNS](capturas/08-duckdns.png)
![Paso 6 - nslookup](capturas/09-nslookup.png)

---

## 7. Pruebas desde un navegador externo

1. Abrir `http://SUBDOMINIO.duckdns.org` desde el navegador del PC.
2. Abrir la misma dirección desde un celular con datos móviles (red externa a la VM).
3. Probar las funcionalidades: menú en móvil, modo oscuro, filtro de proyectos y formulario.

![Paso 7 - Sitio en el PC](capturas/10-sitio-pc.png)
![Paso 7 - Sitio en el celular](capturas/11-sitio-movil.png)

---

## Resultado

| Elemento | Valor |
|---|---|
| Máquina virtual | `servidor-taller` |
| IP pública | `IP_PUBLICA` |
| Servidor web | Nginx |
| Subdominio | http://SUBDOMINIO.duckdns.org |
