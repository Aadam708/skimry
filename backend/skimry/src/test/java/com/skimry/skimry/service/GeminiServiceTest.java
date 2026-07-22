package com.skimry.skimry.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.concurrent.CompletableFuture;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class GeminiServiceTest {

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Manual Test: Generate 3-bullet AI Summary from Chrome Extension text")
    void testGenerateSummaryWithRealText() throws Exception {
        // -------------------------------------------------------------------
        // PASTE YOUR EXTRACTED TEXT FROM CHROME EXTENSION BELOW:
        // -------------------------------------------------------------------
        String extractedTextFromExtension = """
            "Sport Football Liverpool FC LIVE Updated 5 mins ago Liverpool transfer news LIVE: Yan Diomande U-turn, Bradley Barcola latest, Ferran Torres pursuit All the latest Liverpool transfer news and gossip at it happens Yan Diomande may not be deemed out of Liverpool's reach just yet(Image: Terence Lewis/Icon Sportswire via Getty Images) Comments 0 SPORT Ian Doyle Chief Liverpool FC Correspondent, Mark Jones Liverpool Content Editor - Sport and Tom Sunderland Sports Writer Welcome to the Liverpool ECHO's live transfer blog. Andoni Iraola and his men have flown out to the United States ahead of their pre-season fixture against Sunderland, Wrexham and Leeds United. The Liverpool boss has taken a group of 31 players to Chicago ahead of an essential period of experimentation. New summer signing Victor Munoz still won't be linking up with the rest of the squad just yet having won the World Cup final on Sunday. However, Jeremy Jacquet - the Reds' only other major signing of the summer - is with the squad and ready to make an impact. That doesn't mean the transfer rumour mill isn't still turning for Iraola and his team, however. And there's news of interest in his former Bournemouth charge, Rayan, gathering pace as a potential Mohamed Salah successor. Bradley Barcola is still the most prominent name being linked with a move to the Reds, but there are plenty of others touted for a switch to Anfield. Stick with us to find out all the latest transfer news and gossip. New Updates Today 10:55 BST Young Liverpool duo to leave Liverpool midfielder Kyle Kelly is close to agreeing a loan move to Forest Green Rovers as the Reds continue to assess their Academy options for the campaign. Kelly is expected to spend the season at the National League team, who are managed by former Wales international Robbie Savage. The 20-year-old, who has been at the Liverpool Academy since 2018, put pen to paper on a new one-year deal earlier this month after uncertainty over his future with his contract up this summer. He was hampered by injury for the first half of the last Premier League 2 campaign but became a regular in the defensive midfield role from the New Year onwards. While yet to feature in a senior club game, Kelly has the rare distinction of already being a full international having made his debut for St Kitts and Nevis in March 2024, and scored his first goal for the country in March. Another Academy midfielder, 21-year-old Tommy Pilling, is also on the move, and is likely to complete a permanent transfer in the coming days to Slovakian top tier side MFK Zemplin Michalovce. Pilling has been at the Academy since he was five years old and progressed through the youth ranks. He played for the senior team in a friendly against Athletic Bilbao last summer and has trained with the first team on a regular basis. Comments 0 Ian Doyle Today 10:29 BST Key Scott transfer detail On the topic of Alex Scott's current transfer quagmire, details regarding Bournemouth's aims for an extension have emerged. Scott, 22, rejected the offer of a new deal at the Vitality Stadium this week. However, there may yet be an outcome that sees him sign fresh terms on the south coast that eventually benefits both Bournemouth and a suitor like Liverpool. Transfer insider Fabrizio Romano reported the Cherries would be willing to insert a release clause into any prospective extension as long as Scott signs on the dotted line. It makes sense from Bournemouth's point of view given that would effectively guarantee a certain amount for the midfielder and rule out the possibility of him leaving for free in 2028. Liverpool may not be as favourable towards that idea considering they (and other admirers) may prefer to negotiate for less than his supposed £80m valuation this summer. The Reds have a trump card in Andoni Iraola, who knows the player intimately from their time together at Bournemouth, though a deal still looks difficult at this stage. (Image: (Photo by Marc Atkins/Getty Images)) Comme..."
            """;

        System.out.println("=================== GEMINI TEST START ===================");
        System.out.println("Sending text length: " + extractedTextFromExtension.length() + " chars");

        // Execute the async method and block until completion (.get())
        CompletableFuture<String> future = geminiService.generateSummary(extractedTextFromExtension);
        String rawJsonResponse = future.get(); // Wait for Gemini response

        System.out.println("\n--- RAW GEMINI RESPONSE ---");
        System.out.println(rawJsonResponse);

        // Verify it parses into a valid List<String> for your JSONB DB column
        List<String> summaryList = objectMapper.readValue(rawJsonResponse, new TypeReference<List<String>>() {});

        System.out.println("\n--- PARSED LIST<STRING> RESULT ---");
        for (int i = 0; i < summaryList.size(); i++) {
            System.out.println((i + 1) + ". " + summaryList.get(i));
        }
        System.out.println("==================== GEMINI TEST END ====================");

        // Assertions to verify output structure
        assertNotNull(rawJsonResponse, "Response should not be null");
        assertFalse(summaryList.isEmpty(), "Summary list should not be empty");
        assertEquals(3, summaryList.size(), "Gemini should produce exactly 3 bullet points");
    }
}
