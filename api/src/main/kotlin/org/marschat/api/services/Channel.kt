package org.marschat.api.services

import org.marschat.api.generated.types.Channel
import org.springframework.stereotype.Service

interface ChannelService {
    fun channels(): List<Channel>
}

@Service
class RemoteChannelService: ChannelService {
    override fun channels(): List<Channel> {
        TODO("Not yet implemented")
    }
}