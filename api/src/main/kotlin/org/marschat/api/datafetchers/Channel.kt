package org.marschat.api.datafetchers

import com.netflix.graphql.dgs.DgsComponent
import com.netflix.graphql.dgs.DgsQuery
import com.netflix.graphql.dgs.InputArgument
import org.marschat.api.generated.types.Channel

@DgsComponent
class ChannelDataFetcher() {
    @DgsQuery
    fun channels(@InputArgument user: Int): List<Channel> {
        val fakeChannel = Channel(1, "public", true)
        return if(user == 1) {
            listOf(fakeChannel)
        } else {
            emptyList()
        }
    }
}