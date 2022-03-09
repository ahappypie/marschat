defmodule Marschat.Message do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query
  alias Marschat.Repo
  alias Phoenix.PubSub
  alias __MODULE__

  schema "messages" do
    field :message, :string
    field :name, :string

    timestamps()
  end

  @doc false
  def changeset(message, attrs) do
    message
    |> cast(attrs, [:name, :message])
    |> validate_required([:name, :message])
    |> validate_length(:message, min: 2)
  end

  def create_message(attrs) do
    %Message{}
    |> changeset(attrs)
    |> Repo.insert()
    |> notify(:message_created)
  end

  def list_messages do
    Message
    |> limit(50)
    |> order_by(desc: :inserted_at)
    |> Repo.all()
  end

  def subscribe() do
    PubSub.subscribe(Marschat.PubSub, "marschat_chat")
  end

  def notify({:ok, message}, event) do
    PubSub.broadcast(Marschat.PubSub, "marschat_chat", {event, message})
  end

  def notify({:error, reason}, _event), do: {:error, reason}
end
