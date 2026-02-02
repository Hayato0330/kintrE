import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpExchange;

import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;

public class AccountApiServer {

    static class Account {
        String name;
        String accountNumber;
        String balanceYen;
        String avatarBase64;

        Account(String name, String accountNumber, String balanceYen, String avatarPath) throws Exception {
            this.name = name;
            this.accountNumber = accountNumber;
            this.balanceYen = balanceYen;

            byte[] bytes = Files.readAllBytes(Path.of(avatarPath));
            this.avatarBase64 = "data:image/png;base64," + Base64.getEncoder().encodeToString(bytes);
        }

        private static String esc(String s) {
            if (s == null) return "";
            return s.replace("\\", "\\\\")
                    .replace("\"", "\\\"")
                    .replace("\n", "\\n")
                    .replace("\r", "\\r");
        }

        String toJson() {
            return """
                {
                  "name": "%s",
                  "accountNumber": "%s",
                  "balanceYen": "%s",
                  "avatarBase64": "%s"
                }
                """.formatted(esc(name), esc(accountNumber), esc(balanceYen), esc(avatarBase64));
        }
    }

    private static void addCorsHeaders(HttpExchange exchange) {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");
    }

    public static void main(String[] args) throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);

        server.createContext("/api/accounts", (exchange -> {
            addCorsHeaders(exchange);

            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                exchange.close();
                return;
            }

            try {
                Account[] accounts = {
                        new Account("Aさん", "1111111", "50000",  "human/human1.png"),
                        new Account("Bさん", "2222222", "82000",  "human/human2.png"),
                        new Account("Cさん", "3333333", "125000", "human/human3.png"),
                        new Account("Dさん", "4444444", "500000", "human/human4.png"),
                };

                StringBuilder sb = new StringBuilder();
                sb.append("[");
                for (int i = 0; i < accounts.length; i++) {
                    sb.append(accounts[i].toJson());
                    if (i < accounts.length - 1) sb.append(",");
                }
                sb.append("]");

                byte[] jsonBytes = sb.toString().getBytes(StandardCharsets.UTF_8);

                exchange.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
                exchange.sendResponseHeaders(200, jsonBytes.length);

                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(jsonBytes);
                }

            } catch (Exception e) {
                e.printStackTrace();
                byte[] err = "{\"error\":\"server error\"}".getBytes(StandardCharsets.UTF_8);
                exchange.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
                exchange.sendResponseHeaders(500, err.length);
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(err);
                }
            } finally {
                exchange.close();
            }
        }));

        server.start();
        System.out.println("API server running → http://localhost:8080/api/accounts");
    }
}
