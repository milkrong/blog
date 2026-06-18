import Foundation

/// Streams line-delimited JSON from one of the controller's WebSocket
/// endpoints (`/traffic`, `/memory`, `/logs`, `/connections`) and exposes the
/// decoded values as an `AsyncThrowingStream`.
final class StreamClient {
    private let endpoint: ControllerEndpoint
    private let session: URLSession
    private var task: URLSessionWebSocketTask?

    init(endpoint: ControllerEndpoint, session: URLSession = .shared) {
        self.endpoint = endpoint
        self.session = session
    }

    /// Opens a WebSocket to `path` and yields each message decoded as `T`.
    /// Cancelling the consuming task tears the socket down.
    func stream<T: Decodable>(path: String, as type: T.Type) -> AsyncThrowingStream<T, Error> {
        AsyncThrowingStream { continuation in
            var components = URLComponents()
            components.scheme = endpoint.webSocketScheme
            components.host = endpoint.host
            components.port = endpoint.port
            components.path = "/" + path
            if !endpoint.secret.isEmpty {
                components.queryItems = [URLQueryItem(name: "token", value: endpoint.secret)]
            }

            var request = URLRequest(url: components.url!)
            if !endpoint.secret.isEmpty {
                request.setValue("Bearer \(endpoint.secret)", forHTTPHeaderField: "Authorization")
            }

            let socket = session.webSocketTask(with: request)
            self.task = socket
            socket.resume()

            let decoder = JSONDecoder()

            @Sendable func receive() {
                socket.receive { result in
                    switch result {
                    case let .failure(error):
                        continuation.finish(throwing: error)
                    case let .success(message):
                        let data: Data?
                        switch message {
                        case let .data(payload): data = payload
                        case let .string(text): data = text.data(using: .utf8)
                        @unknown default: data = nil
                        }
                        if let data, let value = try? decoder.decode(T.self, from: data) {
                            continuation.yield(value)
                        }
                        receive()
                    }
                }
            }
            receive()

            continuation.onTermination = { @Sendable _ in
                socket.cancel(with: .normalClosure, reason: nil)
            }
        }
    }

    func close() {
        task?.cancel(with: .normalClosure, reason: nil)
        task = nil
    }
}
