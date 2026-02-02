import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;

public class AccountApiServer {

    static class Account {
        String accountNumber;
        String balanceYen;
        String avatarBase64;

        Account(String accountNumber, String balanceYen, String avatarPath) throws IOException {
            this.accountNumber = accountNumber;
            this.balanceYen = balanceYen;

            byte[] bytes = Files.readAllBytes(Path.of(avatarPath));
            this.avatarBase64 = "data:image/png;base64," + Base64.getEncoder().encodeToString(bytes);
        }

        String toJson() {
            return """
                {
                    "accountNumber": "%s",
                    "balanceYen": "%s",
                    "avatarBase64": "%s"
                }
                """.formatted(accountNumber, balanceYen, avatarBase64);
        }
    }

    public static void main(String[] args) throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);

        server.createContext("/api/accounts", (exchange -> {
            try {
                // ===== 複数アカウントを配列で保持する =====
                Account[] accounts = {
                    new Account("1111111", "50000", "human/human1.png"),
                    new Account("2222222", "82000", "human/human2.png"),
                    new Account("3333333", "125000", "human/human3.png"),
                    new Account("4444444", "500000", "human/human4.png"),
                };

                // JSON配列を手動で生成
                StringBuilder sb = new StringBuilder();
                sb.append("[");
                for (int i = 0; i < accounts.length; i++) {
                    sb.append(accounts[i].toJson());
                    if (i < accounts.length - 1) sb.append(",");
                }
                sb.append("]");

                String json = sb.toString();

                exchange.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
                exchange.sendResponseHeaders(200, json.getBytes().length);

                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(json.getBytes());
                }

            } catch (Exception e) {
                e.printStackTrace();
                String err = "{\"error\":\"server error\"}";
                exchange.sendResponseHeaders(500, err.length());
                exchange.getResponseBody().write(err.getBytes());
                exchange.close();
            }
        }));

        server.start();
        System.out.println("API server running → http://localhost:8080/api/accounts");
    }
}
