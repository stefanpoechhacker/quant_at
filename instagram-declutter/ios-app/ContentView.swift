import SwiftUI
import WebKit

struct ContentView: View {
    var body: some View {
        InstagramWebView(url: URL(string: "https://www.instagram.com/")!)
            .ignoresSafeArea()
    }
}

struct InstagramWebView: UIViewRepresentable {
    let url: URL

    func makeUIView(context: Context) -> WKWebView {
        let userContentController = WKUserContentController()

        if let scriptURL = Bundle.main.url(forResource: "ReelsBlocker", withExtension: "js"),
           let scriptSource = try? String(contentsOf: scriptURL, encoding: .utf8) {
            let userScript = WKUserScript(
                source: scriptSource,
                injectionTime: .atDocumentStart,
                forMainFrameOnly: false
            )
            userContentController.addUserScript(userScript)
        }

        let configuration = WKWebViewConfiguration()
        configuration.userContentController = userContentController
        configuration.websiteDataStore = .default() // persist login/cookies between launches

        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.allowsBackForwardNavigationGestures = true
        webView.load(URLRequest(url: url))
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}
}
