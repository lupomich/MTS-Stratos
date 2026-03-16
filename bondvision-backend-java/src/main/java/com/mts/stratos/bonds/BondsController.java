package com.mts.stratos.bonds;

import io.micronaut.http.HttpRequest;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;

/**
 * Bonds controller — Phase 3.6a mock implementation.
 *
 * Phase 3.6b: replace mock data with live SDP market data.
 *
 * Routes:
 *   GET  /api/bonds/:bondId/rfq-data
 *   POST /api/bonds/rfq/submit
 */
@Controller("/api/bonds")
public class BondsController {

    private static final Logger log = LoggerFactory.getLogger(BondsController.class);

    @Get("/{bondId}/rfq-data")
    public HttpResponse<?> getRfqData(HttpRequest<?> request, String bondId) {
    List<String> dealers = List.of("MS", "UNI", "MATRIX", "_D01", "_D02", "_D03");

    Map<String, Object> quotes = new LinkedHashMap<>();
    quotes.put("MS", Map.of(
        "bidAxe", "2", "bidSize", "5", "bidYield", 0.78, "bidPrice", 99.9996,
        "askYield", 2.2301, "askPrice", 99.59018, "askSize", "4", "askAxe", "D03"));
    quotes.put("UNI", Map.of(
        "bidAxe", "2", "bidSize", "2.5", "bidYield", 0.8147, "bidPrice", 99.957,
        "askYield", 2.2381, "askPrice", 99.59166, "askSize", "17", "askAxe", "D06"));
    quotes.put("MATRIX", Map.of(
        "bidAxe", "", "bidSize", "7", "bidYield", 2.2407, "bidPrice", 99.58082,
        "askYield", 2.2247, "askPrice", 99.59255, "askSize", "15", "askAxe", "D11"));
    quotes.put("_D01", Map.of(
        "bidAxe", "", "bidSize", "15", "bidYield", 2.244, "bidPrice", 99.58758,
        "askYield", 2.2244, "askPrice", 99.59262, "askSize", "5", "askAxe", "D05"));
    quotes.put("_D02", Map.of(
        "bidAxe", "11", "bidSize", "17", "bidYield", 2.2462, "bidPrice", 99.58728,
        "askYield", 2.2134, "askPrice", 99.59546, "askSize", "7", "askAxe", "D04"));
    quotes.put("_D03", Map.of(
        "bidAxe", "22", "bidSize", "", "bidYield", 2.2564, "bidPrice", 99.58438,
        "askYield", 2.2132, "askPrice", 99.59551, "askSize", "22", "askAxe", "D10"));

    Map<String, Object> bond = new LinkedHashMap<>();
    bond.put("isin", bondId);
    bond.put("description", "Bond " + bondId);
    bond.put("redemptionDate", "2026-06-04");
    bond.put("coupon", 2.5);

    Map<String, Object> response = new LinkedHashMap<>();
    response.put("bond", bond);
    response.put("dealers", dealers);
    response.put("quotes", quotes);

    return HttpResponse.ok(response);
    }

    @Post("/rfq/submit")
    public HttpResponse<?> submitRfq(HttpRequest<?> request, @Body Map<String, Object> body) {
    // Phase 3.6a: mock acknowledgment — will route to SDP in Phase 3.6b
        String rfqId = "RFQ-" + System.currentTimeMillis();
    log.info("RFQ submitted — id {}", rfqId);

        return HttpResponse.ok(Map.of(
                "success", true,
                "rfqId", rfqId,
        "message", "RFQ submitted successfully"));
    }
}
