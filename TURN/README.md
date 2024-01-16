# coturn TURN Server

Dockerfile for [coturn](https://github.com/coturn/coturn) in alpine 3:18.

For using it the following environment parameters need to be set.

```yaml
#example
- env:
- name: INTERNAL_IP
    valueFrom:
    fieldRef:
        fieldPath: status.podIP
- name: TURN_PORT
    value: "3478"
- name: TURN_MIN_PORT
    value: "49152"
- name: TURN_MAX_PORT
    value: "65535"
- name: TURN_REALM
    value: app.pixel
- name: TURN_USER
    valueFrom:
    secretKeyRef:
        key: username
        name: turn-secret
- name: TURN_PASS
    valueFrom:
    secretKeyRef:
        key: password
        name: turn-secret
```