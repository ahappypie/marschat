package io.github.ahappypie.marschat

import akka.actor.{Actor, Props}
import io.github.ahappypie.marschat.grpc.delay.LightDelayRequest

object DelaySupervisor {
  def props: Props = Props(new DelaySupervisor)
}

class DelaySupervisor extends Actor {
  override def receive: Receive = {
    case req: LightDelayRequest => context.actorOf(DelayActor.props).forward(req)
  }
}
